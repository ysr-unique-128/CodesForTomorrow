import { Router } from "express";
import { toJSON } from "../helpers/resuableFunctions.js";
import UsageData from "../models/usage-data.model.js";
import Subscription from "../models/subscriptions.js";
import Plan from "../models/plans.model.js";

const usersRouter = Router();


/*
Returns the user’s total usage for the current month.
Include:
● total units used
● remaining units (monthlyQuota – totalUsed)
● active plan info
*/
usersRouter.get('/:id/current-usage', async(req, res)=> {
    try{
        const id = req.params?.id;
        console.log(`Getting current month usage data for user with id: ${id}`);

        if(!id) return res.status(400).json({ error_message: 'Required fields missing!' });

        const getCurrentUsageResponse = toJSON(await getCurrentUsage(id));

        const status = getCurrentUsageResponse?.status||400;

        if(getCurrentUsageResponse?.status) delete getCurrentUsageResponse.status;
        
        return res.status(status).json(getCurrentUsageResponse);
    }
    catch(error){
        console.log(`Error in usage router: `, error?.message);
        return res.status(500).json({ error_message: 'There was an error while performing the request. Please try later!' });
    }
});

/*
Returns the billing summary for the current month.Include:
● total usage
● plan quota
● extra units (if total usage > quota)
● extra charges (extraUnits × extraChargePerUnit)
● active plan info
*/
usersRouter.get('/:id/billing-summary', async(req, res)=> {
    try{
        const id = req.params?.id;

        if(!id) return res.status(400).json({ error_message: 'Required fields missing!' });

        let getBillingSummaryResponse = toJSON(await getBillingSummary(id));

        const status = getBillingSummaryResponse?.status||400;

        if(getBillingSummaryResponse?.status) delete getBillingSummaryResponse.status;

        return res.status(status).json(getBillingSummaryResponse);
    }
    catch(error){
        console.log(`Error in usage router: `, error?.message);
        return res.status(500).json({ error_message: 'There was an error while performing the request. Please try later!' });
    }
});

const getUserCurrentMonthUsageData = async (id)=> {
    try{
        const startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth()+1);

        const startSeconds = Math.floor(startDate.getTime() / 1000);
        const endSeconds = Math.floor(endDate.getTime() / 1000);

        // console.log('Seconds: ', startSeconds, endSeconds);

        const userUsageData = await UsageData.find({ 
            userId: id,
            createdAt: {
                $gte: startSeconds,
                $lt: endSeconds
            }
        });

        return userUsageData?.at(0);
    }
    catch(error){
        return null;
    }
}

const getCurrentUsage = async(id)=> {
    try{
        const userUsageData = await getUserCurrentMonthUsageData(id);
        // console.log('User usage data: ', userUsageData);

        if(!userUsageData || !userUsageData?.usedUnits) return { status: 404, error_message: 'Usage data not found for give user id!' };

        // Used units
        const userUsedUnits = userUsageData.usedUnits;

        const userSubscription = (await Subscription.find({ userId: id }))?.at(0);

        if(!userSubscription || !userSubscription?.planId) return { status: 404, error_message: 'Subscription not found!' };

        const userPlanId = userSubscription?.planId;

        // console.log('Plan Id: ', userPlanId);

        // Active plan info
        let userPlan = await Plan.findById(userPlanId);
        const userMonthlyQuota = userPlan?.monthlyQuota;
        
        // Remaining units
        const userRemainingUnits = userMonthlyQuota - userUsedUnits;
        
        if(userPlan['_id']) delete userPlan['_id'];

        return { 
            status:200, 
            usedUnits: userUsedUnits, 
            planInfo: userPlan, 
            remainingUnits: userRemainingUnits 
        };
    }
    catch(error){
        console.log(`Error in getCurrentUsage function: `, error?.message);
        return { status: 400, error_message: error?.message }
    }
}

const getBillingSummary = async(id)=> {
    try{
        const userUsageData = await getUserCurrentMonthUsageData(id);

        if(!userUsageData || !userUsageData?.usedUnits) return { status: 404, error_message: 'Usage data not found for give user id!' };
       
        // Total usage
        const userUsedUnits = userUsageData.usedUnits;

        const userSubscription = (await Subscription.find({ userId: id }))?.at(0);

        if(!userSubscription || !userSubscription?.planId) return { status: 404, error_message: 'Subscription not found!' };

        const userPlanId = userSubscription?.planId;

        let userPlan = await Plan.findById(userPlanId);

        // Plan Quota
        const userMonthlyQuota = userPlan?.monthlyQuota;

        console.log(userPlan?.id, userPlan['_id']);

        if(userPlan?.id) delete userPlan.id;

        let response = { status:200, totalUsage: userUsedUnits, planQuota: userMonthlyQuota, planInfo: userPlan };
        
        let extraUnits = 0;
        let extraCharges = 0;

        if(userUsedUnits > userMonthlyQuota) {
            extraUnits = userUsedUnits - userMonthlyQuota;
            if(userPlan?.extraChargePerUnit) extraCharges = extraUnits * userPlan.extraChargePerUnit;
        }
        
        response['extraUnits'] = extraUnits;
        response ['extraCharges'] = extraCharges;
        
        return response;
    }
    catch(error){
        console.log(`Error in getBillingSummary function: `, error?.message);
        return { status: 400, error_message: error?.message }
    }
}

export default usersRouter;

/*
2. GET /users/:id/current-usage
Returns the user’s total usage for the current month.
Include:
● total units used
● remaining units (monthlyQuota – totalUsed)
● active plan info

3. GET /users/:id/billing-summary
Returns the billing summary for the current month.Include:
● total usage
● plan quota
● extra units (if total usage > quota)
● extra charges (extraUnits × extraChargePerUnit)
● active plan info
*/