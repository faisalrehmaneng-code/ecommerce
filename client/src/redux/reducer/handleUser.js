const getInitialUser = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

const initialState = {
  user: getInitialUser()
};

const handleUser = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      localStorage.setItem('user', JSON.stringify(action.payload));
      return { ...state, user: action.payload };

    case 'LOGOUT_USER':
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return { ...state, user: null };

    default:
      return state;
  }
};

export default handleUser;
