import { Router } from "express";
import UsageData from "../models/usage-data.model.js";

const usageRouter = Router();

usageRouter.post('/', async(req, res)=> {
    try{
        const reqBody = req.body;

        if(!reqBody || !reqBody?.userId || !reqBody?.action || !reqBody?.usedUnits) return res.status(400).json({ error_message: 'Required fields missing!' });

        const usageDataResponse = await UsageData.create(reqBody);
        
        return res.status(200).json({ data: 'Usage data saved successfully', usageData: usageDataResponse });
    }
    catch(error){
        console.log(`Error in usage router: `, error?.message);
        return res.status(500).json({ error_message: 'There was an error while saving the usage data. Please try later!' });
    }
});

export default usageRouter;

/*
1. POST /usage
Record a usage entry for a user.
*/