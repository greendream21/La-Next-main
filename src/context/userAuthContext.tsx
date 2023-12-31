import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from 'axios';
import Contant from "../context/contant";
import { signOut, useSession } from "next-auth/react";
//@ts-ignore
const userAuthContext = createContext();
import { getToken } from "@/utils/apiClient";

//@ts-ignore
function UserAuthContextProvider({ children }) {

  const router = useRouter();
  // States
  const [user, setUser] = useState<any>(null);
  const { data: session } = useSession();
  // Functions
  const logIn = async (email: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('action', 'login');
      const user = await axios.post(Contant.API, formData);
      let data = user.data;
      //@ts-ignore
      if (data.success == true) {
        localStorage.setItem("token", data?.token);
        localStorage.setItem("expiry", data?.expiry);
        localStorage.setItem("user", JSON.stringify(data?.user));
        setUser(data?.user);
      }
      return data;
    } catch (error: any) {
      return error;
    }
  };

  const logInWithGoogle = async () => {

  };

  const logInWithMicrosoft = async () => {

  };

  const register = async (email: string, password: string, login_type: string, ex_data: any) => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('login_type', login_type);
      formData.append('data', ex_data ?? "");
      formData.append('action', 'add_user');
      const user = await axios.post(Contant.API, formData);
      let data = user.data;
      //@ts-ignore
      if (data.success == true) {
        localStorage.setItem("token", data?.token);
        localStorage.setItem("expiry", data?.expiry);
        localStorage.setItem("user", JSON.stringify(data?.user));
        setUser(data?.user);
      }
      return data;
    } catch (error: any) {
      return error;
    }
  };

  const getUser = () => {
    return user;
  };

  const logOut = async () => {
    if (session) {
      await signOut({ redirect: false });
    }
    localStorage.clear();

    setUser(null);
    router.push('/login');
  };

  const [isLoading, setIsLoading] = useState(true);

  //@ts-ignore
  // useEffect
  useEffect(() => {
    const unsubscribe = async () => {
      //check session is valid or not
      const config = {
        headers: {
          'Authorization': await getToken(),
          // Other headers can be added here as needed
        }
      };
      const user = await axios.get(Contant.API, config);
      let data = user?.data;
      if (data.success == true) {
        setUser(data?.user);
        setIsLoading(false);
        localStorage.setItem("user", JSON.stringify(data?.user));
      }
      else {
        localStorage.removeItem("user");
        localStorage.removeItem("expiry");
        localStorage.removeItem("token");
        localStorage.setItem("redirct", window.location.href);

        if (!["/reset-password", "/forgot-password", "/register", "/"].includes(router?.pathname)) {
          router.push("/login");
        }
      }
    }
    unsubscribe();
    return () => {
      unsubscribe();
    };
  }, []);

  // Values to Export
  const values = {
    user,
    isLoading,
    logIn,
    logInWithGoogle,
    logInWithMicrosoft,
    register,
    logOut,
    getUser
  };

  // Provider
  return (
    //@ts-ignore
    <userAuthContext.Provider value={values}>
      {children}
    </userAuthContext.Provider>
  );
}

function useUserAuth() {
  return useContext(userAuthContext);
}

export { userAuthContext, useUserAuth, UserAuthContextProvider };