import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import Wallet from "./components/Wallet";

function Collect() {
    const walletRef = useRef(null);
    const [nfts, setNfts] = useState(null);
    
    const getNfts = async () => {
        const nfts = await walletRef.current.getAmountsOwed();
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
            <img src={logo} className="App-logo" alt="logo" style={{ height: '100px' }} />
            <p>
                <h2>NFTs Owned</h2>
            </p>

            <div style={{ alignContent: 'left', alignSelf: 'left', textAlign: 'left', padding: 10 }}>
                <ul style={{ listStyleType: "none", paddingLeft: 15, paddingBottom: 14, alignContent: 'left' }}>
                    {!nfts && <div>be patient...</div>}
                    {nfts && nfts.map((nft, index) => (
                        <li key={index} style={{ padding: "8px 0", borderBottom: "1px solid #ddd" }}>
                            <span><b>{nft.name}</b><br />{nft.address} <b>({nft.quantity.toString()})</b></span>
                            <br /><br />

                            <ul style={{ listStyleType: "none", padding: 0 }}>
                                {nfts && nft.instances.map((token, index) => (
                                    <li key={index} style={{ padding: "8px 0", paddingRight: 100, borderBottom: "1px solid #ddd", display: 'flex', justifyContent: 'space-between' }}>
                                        {token.tokenId} ({token.amountOwed.toString()})  <button onClick={() => collectRoyalties(nft.address, token.tokenId)}>collect</button>
                                    </li>
                                ))}
                            </ul>
                            <br/><br/>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Collect;
