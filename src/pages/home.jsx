import React from 'react';
import '../assets/styles/home.css';
import { Row, Col } from 'react-bootstrap';
import Typewriter from "typewriter-effect";
import { banner1, banner4 } from '../assets/images';
const Home = () => {

    const text = "Your vehicles, our priority. We're dedicated to providing top-notch car transportation logistics services, ensuring your assets are handled with the utmost care."

    return (
        <section className='conatainer-fluid home-main'>
            <img src={banner1} alt='banner' className='home-banner' />
            <Row className='home-content'>
                <Col sm={12} md={12} lg={6} className='home-main-container d-flex justify-content-center align-items-center flex-column'>
                    <div className='rounded home-inner-container d-flex justify-content-start align-items-start flex-column mx-3 px-5'>
                        <h1 className='text-white text-start'>Navigating Routes, Delivering Trust</h1>
                        <p className='text-start px-3 text-white home-desc'>
                            <Typewriter onInit={(typewriter) => typewriter.typeString(text).pauseFor(100).start()} />
                        </p>
                    </div>
                </Col>
                <Col sm={12} md={12} lg={6} className='d-flex justify-content-start align-items-center'>
                    <img src={banner4} alt='img' className='home-side-container-img' />
                </Col>
            </Row>
        </section>
    )
}

export default Home
