import { PayloadToSign721withQuantity, ThirdwebSDK } from "@thirdweb-dev/sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { LOYALTY_CARD_CONTRACT_ADDRESS } from "../../constants/addresses";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const { address } = JSON.parse(req.body);

        if(!process.env.PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY is not set.");
        }

        const sdk = ThirdwebSDK.fromPrivateKey(
            process.env.PRIVATE_KEY,
            "sepolia",
            {
                secretKey: process.env.SECRET_KEY,
            }
        );

        const loyaltyCardContract = sdk.getContract(LOYALTY_CARD_CONTRACT_ADDRESS);

        const payload: PayloadToSign721withQuantity = {
            to: address,
            metadata: {
                name: "Loyalty Card",
                description: "Here's your boost for the day",
                image: "https://static.vecteezy.com/system/resources/previews/025/874/567/non_2x/cartoon-monkey-lifting-barbell-flat-illustration-cute-monkey-gym-workout-cartoon-style-vector.jpg",
                attributes: [
                    {
                        trait_type: "Points",
                        value: 0,
                    },
                ],
            },
        };

        const signedPayload = (await loyaltyCardContract).erc721.signature.generate(payload);

        return res.status(200).json({ 
            signedPayload: JSON.parse(JSON.stringify(signedPayload)), 
        });

    } catch(error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
} 