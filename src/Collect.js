import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import Wallet from "./components/Wallet";

function Collect() {
    const walletRef = useRef(null);
    const [nfts, setNfts] = useState(null);

    useEffect(() => {
        setNfts([]);
        const getNfts = async () => {
            const nfts = await walletRef.current.getAmountsOwed();
            console.log(nfts);
            setNfts(nfts);
        };

        getNfts();
    }, []);

    const collectRoyalties = async (nftAddress, tokenId) => {
        const result = await walletRef.current.collectRoyalties(nftAddress, tokenId);
    };

    const [formData, setFormData] = useState({
    });

    return (
        <div className="App">
            <Wallet ref={walletRef} />
            <img src={logo} className="App-logo" alt="logo" />
            <p>
                NFTs Owned
            </p>

            <ul style={{ listStyleType: "none", padding: 0 }}>
                {!nfts && <div>be patient...</div>}
                {nfts && nfts.map((nft, index) => (
                    <li key={index} style={{ padding: "8px 0", borderBottom: "1px solid #ddd" }}>
                        <span>{nft.name} ({nft.quantity.toString()})</span> 

                        <ul style={{ listStyleType: "none", padding: 0 }}>
                            {nfts && nft.instances.map((token, index) => (
                                <li key={index} style={{ padding: "8px 0", borderBottom: "1px solid #ddd" }}>
                                    <span>{token.tokenId} ({token.amountOwed.toString()})</span> <button onClick={() => collectRoyalties(nft.address, token.tokenId)}>collect</button>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Collect;
