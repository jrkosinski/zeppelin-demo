import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import '../App.css';
import Wallet from "./Wallet";

const AttachPolicies = forwardRef((props, ref) => {
    const walletRef = useRef(null);
    const [policies, setPolicies] = useState([]);
    const [policiesToAdd, setPoliciesToAdd] = useState([]);
    const [formData, setFormData] = useState({
    });

    useEffect(() => {
        getListOfPolicies();
    }, []);
    
    const { onPoliciesAttached } = props;
    const { nftAddress } = props; 

    const attachNftPolicy = async (nftAddress, nftPolicy) => {
        const tx = await walletRef.current.attachNftPolicy(nftAddress, nftPolicy);

        if (tx) {
            const rc = await tx.wait();
            console.log('Transaction hash:', rc.transactionHash);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form data submitted:", formData);
        
        onPoliciesAttached(true);
    };
    
    const cancel = () => {
        onPoliciesAttached(false);
    };
    
    const getListOfPolicies = () => {
        setPolicies([
            {
                id: 1,
                type: "AffiliateReward", 
                percentageBps: 100
            }, 
            {
                id: 2,
                type: "FinancingReward", 
                percentageBps: 20, 
                inventoryLimit: 0, 
                shared: false, 
                fillOrKill: false
            },
            {
                id: 3,
                type: "FinancingReward",
                percentageBps: 140,
                inventoryLimit: 100,
                shared: false
            },
            {
                id: 4,
                type: "FinancingReward",
                percentageBps: 250,
                inventoryLimit: 100,
                shared: false,
                fillOrKill: true
            }
        ]);
    }
    
    const addPolicy = (id) => {
        const policy = policies.find((p) => p.id == id);
        if (policy && !policiesToAdd.find((p) => p.id == id)) {
            policiesToAdd.push(policy);
            setPolicies(policies);
            setPoliciesToAdd(policiesToAdd);
        }
        console.log(policiesToAdd); 
    }

    const removePolicy = (id) => {
        const policy = policiesToAdd.find((p) => p.id == id);
        if (policy && !policies.find((p) => p.id == id)) {
            policies.push(policy);
            setPolicies(policies);
            setPoliciesToAdd(policiesToAdd);
        }
        console.log(policiesToAdd);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    useImperativeHandle(ref, () => ({
    }));

    return (
        <div>
            <Wallet ref={walletRef} />
            <h3>Step 2: Attach Policies</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ justifyContent: 'space-between', alignContent: 'left', alignSelf: 'left', textAlign: 'left', }}>
                    
                </div>
                <br /><br />
                <div>
                    <button type="submit">done</button>
                </div>
            </form>
            {policiesToAdd && policiesToAdd.map((policy, index) => (
                <li key={index} style={{ padding: "8px 0", paddingRight: 100, borderBottom: "1px solid #ddd", display: 'flex', justifyContent: 'space-between' }}>
                    {policy.type} {policy.percentageBps / 100}%:&nbsp;&nbsp;<button onClick={() => removePolicy(policy.id)}>remove</button>
                </li>
            ))}
            <hr />
            <ul>
                {policies && policies.map((policy, index) => (
                    <li key={index} style={{ padding: "8px 0", paddingRight: 100, borderBottom: "1px solid #ddd", display: 'flex', justifyContent: 'space-between' }}>
                        {policy.type} {policy.percentageBps / 100}%:&nbsp;&nbsp;<button onClick={() => addPolicy(policy.id)}>add</button>
                    </li>
                ))}
            </ul>
        </div>
    );
});

export default AttachPolicies;
