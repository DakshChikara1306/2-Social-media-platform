import { Inngest } from "inngest";
import User from "../models/User.js";
import sendEmail  from "../configs/nodeMailer.js";
import Connection from "../models/Connection.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";

export const inngest = new Inngest({ id: "pingup-app" });

// create user
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    let username = email_addresses[0].email_address.split("@")[0];

    const existing = await User.findOne({ username });

    if (existing) {
      username = username + Math.floor(Math.random() * 1000);
    }

    await User.create({
      _id: id,
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      username,
      profile_picture: image_url,
    });
  }
);

// update user
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    await User.findByIdAndUpdate(id, {
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
    });
  }
);

// delete user
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    await User.findByIdAndDelete(id);
  }
);

//inngest function to send reminder when a new connection request is added
const sendConnectionRequestReminder = inngest.createFunction(
  { id: "send-connection-request-reminder" },
  { event: "app/connection-request" },
  async ({ event, step }) => {
    const {connectionId} = event.data;
    await step.run("send-connection-request-email", async()=>{
      const Connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
     const subject = "New Connection Request";
      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Hi ${Connection.to_user_id.full_name}</h2>
  <p>You have a new connection request from ${Connection.from_user_id.full_name}</p>
  <p>Click <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">here</a>to view them</p>
  <br>
  <p>Thanks,<br>Pingup - Stay Connected</p>
</div>
    `;
        await sendEmail({
          to: Connection.to_user_id.email,
          subject,
         body,
        });

      // send email to toUser about the connection request from fromUser
      // you can use nodemailer or any email service here
    })    
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24hours ",in24Hours);
    await step.run("send-connection-request-reminder-email", async()=>{
      const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
      if(connection.status === "accepted"){
        return {message:"Already accepted"};
      }
      const subject = "New Connection Request Reminder";
      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Hi ${connection.to_user_id.full_name}</h2>
  <p>This is a reminder that you have a pending connection request from ${connection.from_user_id.full_name}</p>
  <p>Click <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">here</a>to view them</p>
  <br>
  <p>Thanks,<br>Pingup - Stay Connected</p>
</div>
    `;
        await sendEmail({
          to: connection.to_user_id.email,
          subject,
         body,
        });
        return ({message:"Reminder sent"});
    })
  }
  
)

//inngest function to delete story after 24 hours
const deleteStory = inngest.createFunction(
  { id: "story-delete" },
  { event: "app/story.delete" },
  async({ event, step }) => {
    const { storyId } = event.data;
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24hours ",in24Hours);
    await step.run("delete-story", async()=>{
      await Story.findByIdAndDelete(storyId);
      return ({message:"Story deleted"});
    })
  }
)

const sendNotificationOfUnseenMessages = inngest.createFunction(
  { id: "send-notification-of-unseen-messages" },
  {cron: "TZ=America/New_York 0 9 * * *"},
  async({step})=>{
    const messages = await Message.find({seen: false}).populate('to_user_id');
    const unseenCount = {}
    messages.map(message=>{
      unseenCount[message.to_user_id._id]  = (unseenCount[message.to_user_id._id] || 0) + 1;
    })
    for(const userId in unseenCount){
      const user  = await User.findById(userId);
      const subject = `You have ${unseenCount[userId]} unseen messages`;
      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Hi ${user.full_name}</h2>
  <p>You have ${unseenCount[userId]} unseen messages. Please check your inbox.</p>
  <p>Click <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">here</a>to view them</p>
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
    return {messages:"Notifications sent"};
  }
)

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendConnectionRequestReminder,
  deleteStory,
  sendNotificationOfUnseenMessages
];
