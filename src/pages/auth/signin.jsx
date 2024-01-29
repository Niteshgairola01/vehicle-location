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
import { singInUser } from '../../hooks/authHooks';
import { ErrorToast, SuccessToast } from '../../components/toast/toast';
import { logo, trailer } from '../../assets/images';

import { BiSolidHide } from "react-icons/bi";
import { BiSolidShow } from "react-icons/bi";

const Signin = () => {

    const [form, setForm] = useState({});
    const [pass, setPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);

    const text = "Your vehicles, our priority. We're dedicated to providing top-notch car transportation logistics services, ensuring your assets are handled with the utmost care.";
    const navigate = useNavigate();

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

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/track');

        localStorage.setItem("name", 'test');
        localStorage.setItem('keepLoggedIn', keepLoggedIn);

        // singInUser(form).then((response) => {
        //     if (response.status === 200) {
        //         SuccessToast("Logged in successfully");
        //         setTimeout(() => {
        //             navigate('/track');
        //         }, 500);
        //     } else ErrorToast("Unable to log in");
        // }).catch(err => err?.response?.data ? ErrorToast(err?.response?.data) : ErrorToast("Something went wrong"));
    };

    return (
        <Row className='login-main-container p-5'>
            <Col className='login-form-container bg-white position-relative px-5 sm={12}' lg={4}>
                <div className='position-absolute' style={{ top: 60 }}>
                    <GiPathDistance className='location-path-icon' />
                </div>
                <div className='d-flex justiy-content-center align-items-center flex-column mt-5 pt-5'>
                    <img src={logo} className='auth-logo'/>
                    <h2 className='thm-dark mt-5'>Sign in</h2>
                    <Form className='w-50 mt-5' onSubmit={handleSubmit} style={{ zIndex: 2 }}>
                        <Input label="Username" type="text" onChange={handleChange} name="username" className="bg-white" placeholder="username" autocomplete="off" />
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
                </div>
            </Col>
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
        </Row>
    )
}

export default Signin
