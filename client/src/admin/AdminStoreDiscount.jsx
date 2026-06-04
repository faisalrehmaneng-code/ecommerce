import { useEffect, useState } from "react";
import { getDiscountData, saveProductDiscount, saveStoreDiscount } from "../api";
import { useDispatch } from 'react-redux';
import { resetCart } from '../redux/action';
import toast from "react-hot-toast";

export default function AdminDiscountDashboard() {
    const [storeDiscount, setStoreDiscount] = useState({
        discountType: "percent",
        discountValue: 0,
        isActive: false
    });
    const dispatch = useDispatch();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const isStoreDiscountActive = storeDiscount.isActive;


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getDiscountData();

            if (data.storeDiscount) {
                setStoreDiscount(data.storeDiscount);
            }

            setProducts(data.products || []);
        } catch (error) {
            toast.error('Failed to load discount data');
        } finally {
            setLoading(false);
        }
    };


    const handleSaveStoreDiscount = async () => {
        try {
            await saveStoreDiscount({
                discountType: storeDiscount.discountType,
                discountValue: storeDiscount.discountValue,
                isActive: storeDiscount.isActive
            });
            dispatch(resetCart());
            toast.success('Store discount saved');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error saving store discount");
        }
    };


    const updateProduct = (id, field, value) => {
        setProducts(prev =>
            prev.map(p =>
                p._id === id ? { ...p, [field]: value } : p
            )
        );
    };

    const handleSaveProductDiscount = async (product) => {
        try {
            await saveProductDiscount(product._id, {
                discountType: product.discountType,
                discountValue: product.discountValue
            });
            dispatch(resetCart());
            toast.success(`Discount saved for ${product.name}`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error saving product discount");
        }
    };

    if (loading) {
        return <h2 style={{ padding: 30 }}>Loading...</h2>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Discount Management</h2>

            <div style={styles.card}>
                <h3 style={styles.subHeading}>Store-Wide Discount</h3>

                <div style={styles.grid}>
                    <div>
                        <label style={styles.label}>Discount Type</label>
                        <select
                            style={styles.input}
                            value={storeDiscount.discountType}
                            onChange={e =>
                                setStoreDiscount({
                                    ...storeDiscount,
                                    discountType: e.target.value
                                })
                            }
                        >
                            <option value="percent">Percentage (%)</option>
                            <option value="flat">Flat Amount</option>
                        </select>
                    </div>

                    <div>
                        <label style={styles.label}>Discount Value</label>
                        <input
                            type="number"
                            style={styles.input}
                            value={storeDiscount.discountValue}
                            onChange={e =>
                                setStoreDiscount({
                                    ...storeDiscount,
                                    discountValue: Number(e.target.value)
                                })
                            }
                        />
                    </div>

                    <div style={styles.switchBox}>
                        <input
                            type="checkbox"
                            checked={storeDiscount.isActive}
                            onChange={() =>
                                setStoreDiscount({
                                    ...storeDiscount,
                                    isActive: !storeDiscount.isActive
                                })
                            }
                        />
                        <span>Activate Store Discount</span>
                    </div>

                    <div>
                        <button
                            style={styles.primaryBtn}
                            onClick={handleSaveStoreDiscount}
                        >
                            Save Store Discount
                        </button>
                    </div>
                </div>

                {isStoreDiscountActive && (
                    <p style={styles.warning}>
                        ⚠ Store discount is active. Product discounts are disabled.
                    </p>
                )}
            </div>

            <div style={styles.card}>
                <h3 style={styles.subHeading}>Product Discounts</h3>

                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Original Price</th>
                            <th>Discount Type</th>
                            <th>Discount Value</th>
                            <th>Final Price</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map(product => (
                            <tr key={product._id} style={{
                                opacity: isStoreDiscountActive ? 0.5 : 1,
                                pointerEvents: isStoreDiscountActive ? "none" : "auto",
                                backgroundColor: isStoreDiscountActive ? "#f9fafb" : "#ffffff",
                                transition: "all 0.2s ease"
                            }}>
                                <td>{product.name}</td>
                                <td>${product.price}</td>

                                <td>
                                    <select
                                        style={styles.input}
                                        disabled={isStoreDiscountActive}
                                        value={product.discountType}
                                        onChange={e =>
                                            updateProduct(
                                                product._id,
                                                "discountType",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">None</option>
                                        <option value="percent">%</option>
                                        <option value="flat">Flat</option>
                                    </select>
                                </td>

                                <td>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        disabled={isStoreDiscountActive}
                                        value={product.discountValue}
                                        onChange={e =>
                                            updateProduct(
                                                product._id,
                                                "discountValue",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </td>

                                <td>
                                    <strong>${product.finalPrice}</strong>
                                </td>

                                <td>
                                    <button
                                        style={styles.secondaryBtn}
                                        disabled={isStoreDiscountActive}
                                        onClick={() => handleSaveProductDiscount(product)}
                                    >
                                        Save
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


const styles = {
    container: {
        padding: "30px",
        fontFamily: "Inter, sans-serif"
    },
    heading: {
        marginBottom: "25px"
    },
    subHeading: {
        marginBottom: "15px"
    },
    card: {
        background: "#ffffff",
        padding: "25px",
        borderRadius: "12px",
        marginBottom: "30px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        alignItems: "end"
    },
    label: {
        fontSize: "13px",
        marginBottom: "6px"
    },
    input: {
        width: "100%",
        padding: "9px",
        borderRadius: "6px",
        border: "1px solid #ccc"
    },
    switchBox: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },
    primaryBtn: {
        background: "#2563eb",
        color: "#fff",
        border: "none",
        padding: "10px 18px",
        borderRadius: "6px",
        cursor: "pointer"
    },
    secondaryBtn: {
        background: "#16a34a",
        color: "#fff",
        border: "none",
        padding: "7px 14px",
        borderRadius: "6px",
        cursor: "pointer"
    },
    warning: {
        marginTop: "15px",
        color: "#b45309"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    }
};
