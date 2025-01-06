import { ConnectWallet, Web3Button, useAddress, useContract, useOwnedNFTs } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import { NextPage } from "next";
import { LOYALTY_CARD_CONTRACT_ADDRESS } from "../constants/addresses";
import { sign } from "crypto";

const Home: NextPage = () => {

  const address = useAddress();

  const {
    contract
  } = useContract(LOYALTY_CARD_CONTRACT_ADDRESS);

  const {
    data: ownedNFTs,
    isLoading: isOwnedNFTsLoading
  } = useOwnedNFTs(contract, address);

  const claimLoyaltyCard = async () => {
    try {
      const signedPayloadReq = await fetch("/api/generate-sig", {
        method: "POST",
        body: JSON.stringify({ 
          address,
        }),
      });

      const json = await signedPayloadReq.json();

      if(!signedPayloadReq.ok) {
        throw new Error(json.error);
      }

      const signedPayload = json.signedPayload;

      const loyaltyCard = await contract?.erc721.signature.mint(signedPayload);
      alert("Loyalty card claimed!");
    } catch(error) {
      console.error(error);
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.loginCard}>
            <ConnectWallet />
            {address ? (
              <>
                {!isOwnedNFTsLoading && (
                  ownedNFTs && ownedNFTs.length > 0 ? (
                    ownedNFTs.map((nft) => (
                      nft.metadata
                    ))
                  ) : (
                    <>
                      <p>No loyalty card found.</p>
                      <Web3Button
                      contractAddress={LOYALTY_CARD_CONTRACT_ADDRESS}
                      action={() => claimLoyaltyCard}>
                      Claim Loyalty Card
                      </Web3Button>
                    </>
                  )
                )}
              </>
            ) : (
              <p>Login to view loyalty card.</p>
            )}
        </div>
      </div>
    </main>
  );
};

export default Home;
