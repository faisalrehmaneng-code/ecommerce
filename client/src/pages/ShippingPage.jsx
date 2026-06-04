import React, { useState, useEffect } from "react";
import { Footer, Navbar } from "../components";
import { fetchShippingPolicy } from "../api"; // Import the API function

const ShippingPage = () => {
    const [policy, setPolicy] = useState("");
    const [loading, setLoading] = useState(true);

    // --- FETCH POLICY FROM API ---
    useEffect(() => {
        const loadPolicy = async () => {
            setLoading(true);
            try {
                const content = await fetchShippingPolicy();
                setPolicy(content);
            } catch (error) {
                console.error("Failed to load shipping policy", error);
            } finally {
                setLoading(false);
            }
        };
        loadPolicy();
    }, []);

    return (
        <>


            <div className="container my-5 py-4">
                <div className="policy-wrapper">

                    <h1 className="page-title display-5">Shipping Policy</h1>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-dark" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : policy ? (

                        <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", color: "#333", fontSize: "1rem" }}>
                            {policy}
                        </div>
                    ) : (
                        <p>No shipping policy available at the moment. Please check back later.</p>
                    )}

                </div>
            </div>


        </>
    );
};

export default ShippingPage;