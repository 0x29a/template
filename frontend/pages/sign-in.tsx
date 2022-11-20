import Link from "next/link";

import { useDispatch } from "react-redux";
import { useForm, FieldValues } from "react-hook-form";
import { useGoogleLogin } from "@react-oauth/google";

import ButtonWithSpinner from "../components/ButtonWithSpinner/ButtonWithSpinner";
import { Token, useLoginCreateMutation, useGoogleCreateMutation, SocialLogin } from "../lib/backendApi";
import { setFieldErrors, invalid } from "../lib/utils";
import { setToken } from "../lib/slices/authSlice";

import { GoogleLogin } from "@react-oauth/google";

type FormInputs = {
  email: string;
  password: string;
  non_field_errors: string;
};

const SignIn = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormInputs>({
    reValidateMode: "onSubmit",
    shouldUseNativeValidation: true,
  });

  const dispatch = useDispatch();
  const [login, loginResult] = useLoginCreateMutation();
  const onSubmit = (data: FieldValues) =>
    login({
      login: {
        email: data.email,
        password: data.password,
      },
    }).then((result) => {
      setFieldErrors<FormInputs, Token>(setError, result);
      if ("data" in result) {
        dispatch(setToken(result.data.key));
      }
    });

  const emailField = register("email", { required: true });
  const passwordField = register("password", { required: true });
  register("non_field_errors");

  const [googleLogin, googleLoginResult] = useGoogleCreateMutation()
  const triggerGoogleLogin = useGoogleLogin({
    // TODO: process onError
    onSuccess: tokenResponse => {
      googleLogin({
        socialLogin: {
          access_token: tokenResponse.access_token
        }
      }).then((result) => {
        setFieldErrors<FormInputs, SocialLogin>(setError, result);
        if ("data" in result) {
          // @ts-ignore
          dispatch(setToken(result.data.key));
        }
      });
    },
  });
  return (
    <section className="bg-gradient-to-b from-gray-100 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          {/* Page header */}
          <div className="max-3-xl mx-auto text-center pb-12 md:pb-20">
            <h1 className="h1">Welcome back. Some pathetic quote.</h1>
          </div>

          {/* Form */}
          <div onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto">
            <form>
              <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`form-input w-full text-gray-800 outline-none ${errors.email && invalid}`}
                    placeholder="Enter your email address"
                    {...emailField}
                  />
                  {errors.email && <p className="mt-2 text-center text-red-500">{errors.email.message}</p>}
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <div className="flex justify-between">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="password">
                      Password
                    </label>
                    <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
                      Having trouble signing in?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    className={`form-input w-full text-gray-800 outline-none ${errors.password && invalid}`}
                    placeholder="Enter your password"
                    {...passwordField}
                  />
                  {errors.password && <p className="mt-2 text-center text-red-500">{errors.password.message}</p>}
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 mt-6">
                <div className="w-full px-3">
                  <ButtonWithSpinner loading={loginResult.isLoading}>Sign In</ButtonWithSpinner>
                </div>
              </div>
              {errors.non_field_errors && (
                <p className="mt-6 text-center text-red-500">{errors.non_field_errors.message}</p>
              )}
            </form>
            <div className="flex items-center my-6">
              <div className="border-t border-gray-300 grow mr-3" aria-hidden="true"></div>
              <div className="text-gray-600 italic">Or</div>
              <div className="border-t border-gray-300 grow ml-3" aria-hidden="true"></div>
            </div>
            <form>
              <div className="flex flex-wrap -mx-3">
                <div className="w-full px-3">
                  <button className="btn px-0 text-white bg-red-600 hover:bg-red-700 w-full relative flex items-center" onClick={() => {triggerGoogleLogin()}}>
                    <svg
                      className="w-4 h-4 fill-current text-white opacity-75 shrink-0 mx-4"
                      viewBox="0 0 16 16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M7.9 7v2.4H12c-.2 1-1.2 3-4 3-2.4 0-4.3-2-4.3-4.4 0-2.4 2-4.4 4.3-4.4 1.4 0 2.3.6 2.8 1.1l1.9-1.8C11.5 1.7 9.9 1 8 1 4.1 1 1 4.1 1 8s3.1 7 7 7c4 0 6.7-2.8 6.7-6.8 0-.5 0-.8-.1-1.2H7.9z" />
                    </svg>
                    <span className="flex-auto pl-16 pr-8 -ml-16">Continue with Google</span>
                  </button>
                </div>
              </div>
            </form>

<GoogleLogin
  onSuccess={credentialResponse => {
    console.log(credentialResponse);
  }}
  onError={() => {
    console.log("Login Failed");
  }}
  ux_mode="redirect"
/>
            <div className="text-gray-600 text-center mt-6">
              Don’t you have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline transition duration-150 ease-in-out">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
