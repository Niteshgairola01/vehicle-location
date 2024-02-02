import React, { useEffect, useState } from 'react'
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Col, Form, Row } from 'react-bootstrap'
import '../../assets/styles/auth.css';
import Typewriter from "typewriter-effect";
import { GiPathDistance } from "react-icons/gi";
import { Input } from '../../components/form/Input';
import Button from '../../components/Button/coloredButton';
import { useNavigate } from 'react-router-dom';
import { autoSignOutUser, signOutUser, singInUser, updateUser } from '../../hooks/authHooks';
import { ErrorToast, SuccessToast } from '../../components/toast/toast';
import { logo, trailer } from '../../assets/images';

import { BiSolidHide } from "react-icons/bi";
import { BiSolidShow } from "react-icons/bi";

const Signin = () => {

    const [form, setForm] = useState({});
    const [pass, setPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);

    //Reset Password 
    const [resetForm, setResetForm] = useState({});
    const [resetId, setResetId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassWord] = useState('');
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const text = "Your vehicles, our priority. We're dedicated to providing top-notch car transportation logistics services, ensuring your assets are handled with the utmost care.";
    const navigate = useNavigate();

    const loggedInUser = localStorage.getItem('userId');
    const storedTimestamp = localStorage.getItem('unloadTimestamp');

    const [load, setLoad] = useState(false);

    useEffect(() => {
        // setTimeout(() => {
        setLoad(true);
        // }, 500)
    }, []);

    useEffect(() => {
        if (loggedInUser === null) {
            navigate('/');
        } else if (loggedInUser.length > 0) {
            if (load === true) {
                // setTimeout(() => {
                //     autoSignOutUser([loggedInUser, null]).then((response) => {
                //         if (response.status === 200) {
                //             console.log("timer added");
                //         }
                //     }).catch((err) => {
                //         console.log("err", err?.response?.data);
                //     });
                // }, 500)
            }

            // const handleSingout = () => {
            // autoSignOutUser([loggedInUser, null]).then((response) => {
            //     if (response.status === 200) {
            //         console.log("timer added");
            //     }
            // }).catch((err) => {
            //     console.log("err", err?.response?.data);
            // })
            // }

            // window.addEventListener('pageshow', handleSingout)

            // if (location.pathname !== '/') {
            // window.onpageshow = handleSingout();
            // }
            // setTimeout(() => {
                navigate('/track')
            // }, 1000)

        }
    }, [load, loggedInUser]);

    localStorage.setItem("test", 3456)
    if (storedTimestamp) {
        const storedTime = parseInt(storedTimestamp, 10);
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - storedTime;

        if (timeDifference > 1 * 30 * 1000) {
            localStorage.clear();
        }
    }

    useEffect(() => {
        AOS.init({
            delay: 200,
        });
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    useEffect(() => {
        setForm({
            ...form,
            password: pass
        })
    }, [pass]);

    useEffect(() => {
        setResetForm({
            ...form,
            userId: resetId,
            password: newPassword
        })
    }, [newPassword]);

    const handleSubmit = (e) => {
        e.preventDefault();

        singInUser(form).then((response) => {
            if (response.status === 200) {
                const userData = response?.data;
                localStorage.setItem("userId", userData?.userId);
                localStorage.setItem("role", userData?.role);
                localStorage.setItem("keepLoggedIn", keepLoggedIn);

                setResetId(userData?.userId);
                SuccessToast("Logged in successfully");
                // setTimeout(() => { navigate('/track') }, 500);
                userData?.toResetPassword === "true" ? setShowResetPasswordForm(true) : setTimeout(() => { navigate('/track') }, 500);
            } else ErrorToast("Unable to log in");
        }).catch(err => {
            err?.response?.status === 400 ? ErrorToast("User already logged in on another device") : err?.response?.status === 405 ? ErrorToast("Invalid Password Credentials")
                : err?.response?.status === 410 ? ErrorToast("User not found") : ErrorToast("Something went wrong")
        });
    };

    const handleResetPassword = (e) => {
        e.preventDefault();

        if (newPassword === confirmPassword) {
            const updateForm = [
                {
                    userId: resetId
                },
                resetForm
            ];

            updateUser(updateForm).then((response) => {
                if (response.status === 200) {
                    signOutUser({ userId: resetId }).then((response) => {
                        if (response?.status === 200) {
                            localStorage.clear();
                            // sessionStorage.clear();
                            singInUser(resetForm).then((response) => {
                                if (response.status === 200) {
                                    const userData = response?.data;
                                    localStorage.setItem("userId", userData?.userId);
                                    localStorage.setItem("role", userData?.role);
                                    localStorage.setItem("keepLoggedIn", keepLoggedIn);

                                    setResetId(userData?.userId);
                                    SuccessToast("Logged in successfully");
                                    userData?.toResetPassword === "true" ? setShowResetPasswordForm(true) : setTimeout(() => { navigate('/track') }, 500);
                                } else ErrorToast("Unable to log in");
                            }).catch(err => {
                                err?.response?.status === 400 ? ErrorToast("User already logged in on another device") : err?.response?.status === 405 ? ErrorToast("Invalid Password Credentials")
                                    : err?.response?.status === 410 ? ErrorToast("User not found") : ErrorToast("Something went wrong")
                            });
                        }
                    }).catch(() => ErrorToast("Unable to log out user"));

                } else {
                    ErrorToast("Unable to udpate user");
                }
            }).catch(err => {
                console.log("err", err);
                err?.response?.status === 410 ? ErrorToast("User Id not found") : err?.response?.status === 411 && ErrorToast(err?.response?.data)
            });
        } else {
            ErrorToast("Password and Confirm Password must be the same");
        }
    }

    return (
        <Row className='login-main-container p-5'>
            <Col className='login-form-container bg-white position-relative px-5 sm={12}' lg={4}>
                <div className='position-absolute' style={{ top: 60 }}>
                    <GiPathDistance className='location-path-icon' />
                </div>
                <div className='d-flex justiy-content-center align-items-center flex-column mt-5 pt-5'>
                    <img src={logo} className='auth-logo' />
                    {
                        showResetPasswordForm ? (
                            <>
                                <h2 className='thm-dark mt-5'>Reset Password</h2>
                                <Form className='w-50 mt-5' onSubmit={handleResetPassword} style={{ zIndex: 2 }}>
                                    {/* <Input label="UserId" type="text" className="bg-white" value={resetId} autocomplete="off" disabled={true} /> */}
                                    <div className='m-0 p-0 position-relative'>
                                        <Input label="New Password" type={showNewPass ? 'text' : 'password'} onChange={(e) => setNewPassword(e.target.value)} name="newPassword" className="bg-white" placeholder="new password" autocomplete="off" />
                                        {
                                            newPassword.length > 0 ? (
                                                <span className='pe-2 ps-1 bg-white thm-dark position-absolute' style={{ top: 37, right: 2 }}>
                                                    {
                                                        showNewPass ? (
                                                            <BiSolidShow className='cursor-pointer' onClick={() => setShowNewPass(false)} />
                                                        ) : (
                                                            <BiSolidHide className='cursor-pointer' onClick={() => setShowNewPass(true)} />
                                                        )
                                                    }
                                                </span>
                                            ) : null
                                        }
                                    </div>
                                    <div className='m-0 p-0 position-relative'>
                                        <Input label="Confirm Password" type={showConfirmPass ? 'text' : 'password'} onChange={(e) => setConfirmPassWord(e.target.value)} name="confirmPassword" className="bg-white" placeholder="confirm password" autocomplete="off" />
                                        {
                                            confirmPassword.length > 0 ? (
                                                <span className='pe-2 ps-1 bg-white thm-dark position-absolute' style={{ top: 37, right: 2 }}>
                                                    {
                                                        showConfirmPass ? (
                                                            <BiSolidShow className='cursor-pointer' onClick={() => setShowConfirmPass(false)} />
                                                        ) : (
                                                            <BiSolidHide className='cursor-pointer' onClick={() => setShowConfirmPass(true)} />
                                                        )
                                                    }
                                                </span>
                                            ) : null
                                        }
                                    </div>

                                    {/* <Form.Group className="d-flex justify-content-start align-items-center" >
                                        <Form.Check className='cursor-pointer' checked={keepLoggedIn} onChange={() => setKeepLoggedIn(!keepLoggedIn)} />
                                        <Form.Label className='thm-dark ms-2 mt-1 cursor-pointer' onClick={() => setKeepLoggedIn(!keepLoggedIn)}>Keep me logged in</Form.Label>
                                    </Form.Group> */}
                                    <div className='w-100 mt-3 d-flex justify-content-center align-items-center'>
                                        <Button type="submit" className="py-1 px-4">Reset Password</Button>
                                    </div>
                                </Form>
                            </>
                        ) : (
                            <>
                                <h2 className='thm-dark mt-5'>Sign in</h2>
                                <Form className='w-50 mt-5' onSubmit={handleSubmit} style={{ zIndex: 2 }}>
                                    <Input label="UserId" type="text" onChange={handleChange} name="userId" className="bg-white" placeholder="UserId" autocomplete="off" />
                                    <div className='m-0 p-0 position-relative'>
                                        <Input label="Password" type={showPass ? 'text' : 'password'} onChange={(e) => setPass(e.target.value)} name="password" className="bg-white" placeholder="password" autocomplete="off" />
                                        {
                                            pass.length > 0 ? (
                                                <span className='pe-2 ps-1 bg-white thm-dark position-absolute' style={{ top: 37, right: 2 }}>
                                                    {
                                                        showPass ? (
                                                            <BiSolidShow className='cursor-pointer' onClick={() => setShowPass(false)} />
                                                        ) : (
                                                            <BiSolidHide className='cursor-pointer' onClick={() => setShowPass(true)} />
                                                        )
                                                    }
                                                </span>
                                            ) : null
                                        }
                                    </div>
                                    <Form.Group className="d-flex justify-content-start align-items-center" >
                                        <Form.Check className='cursor-pointer' checked={keepLoggedIn} onChange={() => setKeepLoggedIn(!keepLoggedIn)} />
                                        <Form.Label className='thm-dark ms-2 mt-1 cursor-pointer' onClick={() => setKeepLoggedIn(!keepLoggedIn)}>Keep me logged in</Form.Label>
                                    </Form.Group>
                                    <div className='w-100 mt-3 d-flex justify-content-center align-items-center'>
                                        <Button type="submit" className="py-1 px-5">Sing in</Button>
                                    </div>
                                </Form>
                            </>
                        )
                    }
                </div>
            </Col >
            <Col className='login-side-container' style={{ overflow: 'hidden' }} sm={12} lg={8}>
                <div className='mt-5 d-flex justify-content-start align-items-start flex-column mx-3 px-5'>
                    <h1 className='text-white text-start'>Navigating Routes, Delivering Trust</h1>
                    <p className='text-start pt-2 px-3 text-white home-desc'>
                        <Typewriter onInit={(typewriter) => typewriter.typeString(text).pauseFor(100).start()} />
                    </p>
                    <div data-aos="fade-left">
                        <div className='position-relative w-100'>
                            <img src={trailer} alt='trailer' className='login-trailer' />
                            {/* <span className='animatedBorder animated-border-top'></span>
                            <span className='animatedBorder animated-border-right'></span>
                            <span className='animatedBorder animated-border-bottom'></span>
                            <span className='animatedBorder animated-border-left'></span> */}
                        </div>
                    </div>
                </div>
            </Col>
        </Row >
    )
}

export default Signin
