import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.png';
import './App.css';
import Wallet from "./components/Wallet";

function Collect() {
    const walletRef = useRef(null);
    const [nfts, setNfts] = useState(null);
    
    const getNfts = async () => {
        const nfts = await walletRef.current.getAmountsOwed();
        console.log(nfts);
        setNfts(nfts);
    };

    useEffect(() => {
        getNfts();
    }, []);

    const collectRoyalties = async (nftAddress, tokenId) => {
        const tx = await walletRef.current.collectRoyalties(nftAddress, tokenId); 
        
        if (tx) {
            const rc = await tx.wait();
            console.log('Transaction hash:', rc.transactionHash);
            await getNfts();
        }
    };

    return (
        <div className="App">
            <Wallet ref={walletRef} />
            <img src={logo} alt="logo" style={{ height: '100px' }} />
            <h2>NFTs Owned</h2>

            <div style={{ alignContent: 'left', alignSelf: 'left', textAlign: 'left', padding: 10 }}>
                <ul style={{ listStyleType: "none", paddingLeft: 15, paddingBottom: 14, alignContent: 'left' }}>
                    {!nfts && <div>be patient...</div>}
                    {nfts && nfts.map((nft, index) => (
                        <div key={index}>
                        {nft.numberOwned > 0 && 
                        <li key={index} style={{ padding: "8px 0", borderBottom: "1px solid #ddd" }}>
                            <span><b>{nft.name}</b><br />{nft.address} <b>({nft.numberOwned.toString()} owned by you)</b></span>
                            <br /><br />

                            <ul style={{ listStyleType: "none", padding: 0 }}>
                                {nfts && nft.numberOwned > 0 && nft.instances.map((token, index) => (
                                    <li key={index} style={{ padding: "8px 0", paddingRight: 100, borderBottom: "1px solid #ddd", display: 'flex', justifyContent: 'space-between' }}>
                                        {token.tokenId}: {token.affiliateId} <b>({token.amountOwed.toString()} owed to you)</b>  {token.amountOwed > 0 && <button onClick={() => collectRoyalties(nft.address, token.tokenId)}>collect</button>}
                                    </li>
                                ))}
                            </ul>
                            <br/><br/>
                        </li>
                        }
                        </div>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Collect;
