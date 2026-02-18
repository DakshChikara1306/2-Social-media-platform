export const protect = async (req, res, next) => {
    try{
        const {userId} = await req.auth();
        if(!userId){
            return res.json({message: "Unauthorized" , success: false});
        }
        next();

    }catch(err){
        res.json({message: err.message, success: false});
    }
}