import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import Wallet from "./components/Wallet";

function Buy() {
    const walletRef = useRef(null);
    const [nfts, setNfts] = useState(null);
    
    useEffect(() => {
        setNfts([]);
        const getNfts = async () => {
            const nfts = await walletRef.current.getNftsForSale(); 
            setNfts(nfts);
        };

        getNfts();
    }, []);

    const purchaseNft = async (nftAddress, tokenId) => {
        console.log('purchase', nftAddress, tokenId);
        const result = await walletRef.current.purchaseNft(nftAddress, tokenId);
    };

    const [formData, setFormData] = useState({
        nftAddress: "",
        tokenId: 1
    });

    return (
        <div className="App">
            <Wallet ref={walletRef} />
            <img src={logo} className="App-logo" alt="logo" />
            <p>
                Buy a Product NFT
            </p>
            
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {!nfts && <div>be patient...</div>}
                {nfts && nfts.map((nft, index) => (
                    <li key={index} style={{ padding: "8px 0", borderBottom: "1px solid #ddd" }}>
                        <span>{nft.productId} - buy for {nft.price.toString()}</span>
                        <ul>
                            {nft.instances.map((instance, index) => (
                                <li key={index} style={{ padding: "8px 0", borderBottom: "1px solid #ddd" }}>
                                    {instance.tokenId} {instance.affiliateId}  <button onClick={() => purchaseNft(nft.address, instance.tokenId)}>buy</button>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Buy;
