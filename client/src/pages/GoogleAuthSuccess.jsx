import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// Ensure your setUser action handles the user object properly
import { setUser } from '../redux/action/userAction';

const GoogleAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const tokenWithBearer = searchParams.get('token');
        const userEncoded = searchParams.get('user');

        if (tokenWithBearer && userEncoded) {
            try {
                localStorage.setItem('token', tokenWithBearer);

                const decodedUser = JSON.parse(atob(userEncoded));

                localStorage.setItem('user', JSON.stringify(decodedUser));

                dispatch(setUser(decodedUser));

                navigate('/');

                window.location.reload();
            } catch (error) {
                console.error("Auth parsing error:", error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate, searchParams, dispatch]);

    return (
        <div className="text-center my-5">
            <h2>Authentication Successful</h2>
            <p>Finalizing your login, please wait...</p>
            <div className="spinner-border text-primary"></div>
        </div>
    );
};

export default GoogleAuthSuccess;