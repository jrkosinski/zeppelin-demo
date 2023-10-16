import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import '../App.css';
import Wallet from "./Wallet";

const CreateNft = forwardRef((props, ref) => {
    const walletRef = useRef(null);
    const [nftAddress, setNftAddress] = useState(null);
    const [formData, setFormData] = useState({
        productName: "",
        brandName: "",
        productUrl: ""
    });
    
    const { onNftCreated } = props;

    const createNft = async (productName, brandName, url) => {
        const fieldNames = ["brand", "url"];
        const fieldValues = [brandName, url];
        const tx = await walletRef.current.createNft(productName, fieldNames, fieldValues);
        let newNftAddress = null;

        if (tx) {
            const rc = await tx.wait();
            console.log(tx);
            console.log(rc);
            console.log('Transaction hash:', rc.transactionHash);

            //get the new NFT's address 
            rc.events.forEach((e) => {
                console.log(e);
                if (e.event == "NftCreated") {
                    newNftAddress = e.args.nftAddress;
                    console.log(newNftAddress);
                }
            });
        }

        return newNftAddress;
    };
    
    const getNftAddress = () => {
        return nftAddress;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form data submitted:", formData);
        //const newNftAddress = await createNft(
        //    formData.productName, formData.brandName, formData.productUrl
        //);
        const newNftAddress = "0x9C570f23490b1A2df85AEFc9B1280f52aFbf487d";
        console.log("new NFT:", newNftAddress);
        
        setNftAddress(newNftAddress);
        onNftCreated(newNftAddress);
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
            <h3>Step 1: Create NFT</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ justifyContent: 'space-between', alignContent: 'left', alignSelf: 'left', textAlign: 'left', }}>
                    <div>
                        <label>
                            product name  &nbsp;
                            <input
                                type="text"
                                name="productName"
                                value={formData.productName}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            brand name  &nbsp;
                            <input
                                type="text"
                                name="brandName"
                                value={formData.brandName}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            product url  &nbsp;
                            <input
                                type="text"
                                name="productUrl"
                                value={formData.productUrl}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                </div>
                <br /><br />
                <div>
                    <button type="submit">create</button>
                </div>
            </form>
        </div>
    );
});

export default CreateNft;
