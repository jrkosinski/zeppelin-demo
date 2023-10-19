import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import '../App.css';
import Wallet from "./Wallet";

const PostForSale = forwardRef((props, ref) => {
    const walletRef = useRef(null);
    const [formData, setFormData] = useState({
        salePrice: 0
    });

    const { onPosted } = props;
    const { nftAddress } = props;


    const postToStore = async (price) => {
        const tx = await walletRef.current.postToStore(nftAddress, price);

        if (tx) {
            const rc = await tx.wait();
            console.log('Transaction hash:', rc.transactionHash);
            return true;
        }
    };

    const postForSale = async () => {
        const tx = await walletRef.current.postForSale(nftAddress);

        if (tx) {
            const rc = await tx.wait();
            //console.log('Transaction hash:', rc.transactionHash);
            return true;
        }
    };

    const getNftAddress = () => {
        return nftAddress;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form data submitted:", formData);
        if (await postToStore(
            parseInt(formData.salePrice), [], []
        )) {
            await postForSale();
        }

        //TODO: action after posting is errorful
        onPosted();
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
            <h3>Step 4: Add to Store</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ justifyContent: 'space-between', alignContent: 'left', alignSelf: 'left', textAlign: 'left', }}>
                    <div>
                        <label>
                            price  &nbsp;
                            <input
                                type="text"
                                name="salePrice"
                                value={formData.salePrice}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                </div>
                <br /><br />
                <div>
                    <button type="submit">post</button>
                </div>
            </form>
        </div>
    );
});

export default PostForSale;
