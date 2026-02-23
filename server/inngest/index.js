// ========================== IMPORTS ==========================
import { Inngest } from "inngest";

// Models
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";

// Services
import sendEmail from "../configs/nodeMailer.js";


// ========================== INNGEST CLIENT ==========================
export const inngest = new Inngest({
  id: "pingup-app",
});


// ========================== USER SYNC ==========================

/**
 * Sync user creation from Clerk → DB
 */
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },

  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    // Generate username from email
    let username = email_addresses[0].email_address.split("@")[0];

    // Ensure uniqueness
    const existing = await User.findOne({ username });
    if (existing) {
      username = username + Math.floor(Math.random() * 1000);
    }

    // Create user
    await User.create({
      _id: id,
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      username,
      profile_picture: image_url,
    });
  }
);


/**
 * Sync user update from Clerk → DB
 */
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },

  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    await User.findByIdAndUpdate(id, {
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
    });
  }
);


/**
 * Sync user deletion from Clerk → DB
 */
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },

  async ({ event }) => {
    const { id } = event.data;

    await User.findByIdAndDelete(id);
  }
);


// ========================== CONNECTION REMINDER ==========================
/**
 * Send email on connection request + reminder after 24h
 */
const sendConnectionRequestReminder = inngest.createFunction(
  { id: "send-connection-request-reminder" },
  { event: "app/connection-request" },

  async ({ event, step }) => {

    const { connectionId } = event.data;

    // ================= SEND INITIAL EMAIL =================
    await step.run("send-connection-request-email", async () => {

      const ConnectionDoc = await Connection.findById(connectionId)
        .populate("from_user_id to_user_id");

      const subject = "New Connection Request";

      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${ConnectionDoc.to_user_id.full_name}</h2>
        <p>You have a new connection request from ${ConnectionDoc.from_user_id.full_name}</p>
        <p>
          Click 
          <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">
            here
          </a> to view them
        </p>
        <br>
        <p>Thanks,<br>Pingup - Stay Connected</p>
      </div>
      `;

      await sendEmail({
        to: ConnectionDoc.to_user_id.email,
        subject,
        body,
      });

    });


    // ================= WAIT 24 HOURS =================
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await step.sleepUntil("wait-for-24hours", in24Hours);


    // ================= SEND REMINDER =================
    await step.run("send-connection-request-reminder-email", async () => {

      const connection = await Connection.findById(connectionId)
        .populate("from_user_id to_user_id");

      // Skip if already accepted
      if (connection.status === "accepted") {
        return { message: "Already accepted" };
      }

      const subject = "New Connection Request Reminder";

      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${connection.to_user_id.full_name}</h2>
        <p>
          This is a reminder that you have a pending connection request 
          from ${connection.from_user_id.full_name}
        </p>
        <p>
          Click 
          <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">
            here
          </a> to view them
        </p>
        <br>
        <p>Thanks,<br>Pingup - Stay Connected</p>
      </div>
      `;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });

      return { message: "Reminder sent" };
    });
  }
);


// ========================== DELETE STORY ==========================
/**
 * Delete story after 24 hours
 */
const deleteStory = inngest.createFunction(
  { id: "story-delete" },
  { event: "app/story.delete" },

  async ({ event, step }) => {

    const { storyId } = event.data;

    // Wait 24 hours
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await step.sleepUntil("wait-for-24hours", in24Hours);


    // Delete story
    await step.run("delete-story", async () => {
      await Story.findByIdAndDelete(storyId);

      return { message: "Story deleted" };
    });
  }
);


// ========================== UNSEEN MESSAGE NOTIFICATIONS ==========================
/**
 * Daily cron job to notify users about unseen messages
 */
const sendNotificationOfUnseenMessages = inngest.createFunction(
  { id: "send-notification-of-unseen-messages" },
  { cron: "TZ=America/New_York 0 9 * * *" },

  async ({ step }) => {

    // ================= FETCH UNSEEN MESSAGES =================
    const messages = await Message.find({ seen: false })
      .populate("to_user_id");

    const unseenCount = {};


    // ================= COUNT PER USER =================
    messages.map((message) => {
      unseenCount[message.to_user_id._id] =
        (unseenCount[message.to_user_id._id] || 0) + 1;
    });


    // ================= SEND EMAIL =================
    for (const userId in unseenCount) {

      const user = await User.findById(userId);

      const subject = `You have ${unseenCount[userId]} unseen messages`;

      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${user.full_name}</h2>
        <p>
          You have ${unseenCount[userId]} unseen messages. 
          Please check your inbox.
        </p>
        <p>
          Click 
          <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">
            here
          </a> to view them
        </p>
        <br>
        <p>Thanks,<br>Pingup - Stay Connected</p>
      </div>
      `;

      await sendEmail({
        to: user.email,
        subject,
        body,
      });
    }

    return { message: "Notifications sent" };
  }
);


// ========================== EXPORT FUNCTIONS ==========================
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendConnectionRequestReminder,
  deleteStory,
  sendNotificationOfUnseenMessages,
];