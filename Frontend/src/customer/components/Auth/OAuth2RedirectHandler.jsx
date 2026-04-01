import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { socialLoginSuccess } from "../../../Redux/Auth/Action";

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (token) {
      dispatch(socialLoginSuccess(token));
      
      // Check if they were sent here from the Cart Checkout button
      const redirectTarget = localStorage.getItem("postLoginRedirect");
      if (redirectTarget) {
        localStorage.removeItem("postLoginRedirect"); 
        navigate(redirectTarget);
      } else {
        navigate("/"); 
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-[500px] flex justify-center items-center bg-[#FFF8F5]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-t-transparent border-[#1A1109] animate-spin rounded-none" />
        <p className="font-label uppercase tracking-[0.2em] text-[10px] text-[#1A1109]">
          Verifying Identity...
        </p>
      </div>
    </div>
  );
}