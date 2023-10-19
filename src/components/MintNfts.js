import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import '../App.css';
import Wallet from "./Wallet";
import { ethers } from "ethers";

const MintNfts = forwardRef((props, ref) => {
    const walletRef = useRef(null);
    const [formData, setFormData] = useState({
        mintQuantity: 0
    });

    const { onNftsMinted } = props;
    const { nftAddress } = props;

    const mintNfts = async (quantity, fieldNames, fieldValues) => {
        const tx = await walletRef.current.mintNfts(nftAddress, quantity, fieldNames, fieldValues);

        if (tx) {
            const rc = await tx.wait();
            console.log('Transaction hash:', rc.transactionHash);
        }
    };

    const getNftAddress = () => {
        return nftAddress;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form data submitted:", formData);

        const affiliateIds  = [];
        for (let n = 0; n < formData.mintQuantity; n++) {
            affiliateIds.push(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(nftAddress + (n+1).toString())).substring(0, 20));
        }
        
        await mintNfts(
            parseInt(formData.mintQuantity), ["affiliateId"], affiliateIds
        );
        
        onNftsMinted();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    useImperativeHandle(ref, () => ({
        getNftAddress
    }));

    return (
        <div>
            <Wallet ref={walletRef} />
            <h3>Step 3: Mint NFTs</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ justifyContent: 'space-between', alignContent: 'left', alignSelf: 'left', textAlign: 'left', }}>
                    <div>
                        <label>
                            quantity  &nbsp;
                            <input
                                type="text"
                                name="mintQuantity"
                                value={formData.mintQuantity}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                </div>
                <br /><br />
                <div>
                    <button type="submit">mint</button>
                </div>
            </form>
        </div>
    );
});

export default MintNfts;
