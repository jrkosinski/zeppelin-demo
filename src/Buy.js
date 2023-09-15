import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import Wallet from "./components/Wallet";

function Buy() {
    const walletRef = useRef(null);
    const [nfts, setNfts] = useState(null);
    
    const getNfts = async () => {
        const nfts = await walletRef.current.getNftsForSale();
        setNfts(nfts);
    };
    
    useEffect(() => {
        getNfts();
    }, []);

    const purchaseNft = async (nftAddress, tokenId) => {
        console.log('purchase', nftAddress, tokenId);
        const tx = await walletRef.current.purchaseNft(nftAddress, tokenId);
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
                <h2>Buy a Product NFT</h2>
            </p>
            
            <div style={{alignContent:'left', alignSelf:'left', textAlign:'left', padding:10}}>
                <ul style={{ listStyleType: "none", paddingLeft: 15, paddingBottom: 14, alignContent: 'left' }}>
                    {!nfts && <div>be patient...</div>}
                    {nfts && nfts.map((nft, index) => (
                        <li key={index} style={{ padding: "8px 0", borderBottom: "1px solid #ddd" }}>
                            <span><b>{nft.productId}</b><br/>{nft.address} - price: <b>{nft.price.toString()}</b></span>
                            <br /><br />
                            <ul>
                                {nft.instances.map((instance, index) => (
                                    <li key={index} style={{ padding: "8px 0", paddingRight:100, borderBottom: "1px solid #ddd", display: 'flex', justifyContent: 'space-between' }}>
                                        {instance.tokenId}: {instance.affiliateId}  <button onClick={() => purchaseNft(nft.address, instance.tokenId)}>buy for {nft.price.toString()}</button>
                                    </li>
                                ))}
                            </ul>
                            <br /><br />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Buy;
