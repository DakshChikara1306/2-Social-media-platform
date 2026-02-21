export const protect = async (req, res, next) => {
  try {
    const { userId } = await req.auth(); // Clerk decodes JWT/session here
    if (!userId) return res.json({ success: false, message: "Not authenticated" });
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};