import React, { useState, useEffect } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const Pagination = ({ pages, currentPage, setCurrentPage }) => {

    const numberOfPages = []

    for (let i = 1; i <= pages; i++) {
        numberOfPages.push(i)
    };

    const [currentButton, setCurrentButton] = useState(1)

    const [arrOfCurrButtons, setArrOfCurrButtons] = useState([]);

    useEffect(() => {
        currentPage === 1 && setCurrentButton(1);
    }, [currentPage]);

    useEffect(() => {
        let tempNumberOfPages = [...arrOfCurrButtons]
        let dotsInitial = '...'
        let dotsLeft = '... '
        let dotsRight = ' ...'

        if (numberOfPages.length < 6) {
            tempNumberOfPages = numberOfPages
            setCurrentPage(currentButton);
        }
        else if (currentButton >= 1 && currentButton <= 3) {
            tempNumberOfPages = [1, 2, 3, 4, dotsInitial, numberOfPages.length];
            setCurrentPage(currentButton);
        }

        else if (currentButton === 4) {
            const sliced = numberOfPages.slice(0, 5);
            setCurrentPage(currentButton);
            tempNumberOfPages = [...sliced, dotsInitial, numberOfPages.length];
            setCurrentPage(currentButton);
        }

        else if (currentButton > 4 && currentButton < numberOfPages.length - 2) {
            const sliced1 = numberOfPages.slice(currentButton - 4, currentButton);
            const sliced2 = numberOfPages.slice(currentButton, currentButton + 5);
            tempNumberOfPages = ([1, dotsLeft, ...sliced1, ...sliced2, dotsRight, numberOfPages.length])
            setCurrentPage(currentButton);
        }

        else if (currentButton > numberOfPages.length - 3) {
            const sliced = numberOfPages.slice(numberOfPages.length - 4);
            tempNumberOfPages = ([1, dotsLeft, ...sliced]);
            setCurrentPage(currentButton);
        }

        else if (currentButton === dotsInitial) {
            setCurrentPage(arrOfCurrButtons[arrOfCurrButtons.length - 3] + 1);
        }
        else if (currentButton === dotsRight) {
            setCurrentPage(arrOfCurrButtons[3] + 2);
        }

        else if (currentButton === dotsLeft) {
            setCurrentPage(arrOfCurrButtons[3] - 2);
        }

        setArrOfCurrButtons(tempNumberOfPages);
        if (currentButton !== dotsInitial && currentButton !== dotsLeft && currentButton !== dotsRight) {
            setCurrentPage(currentButton);
        }
    }, [currentButton, pages]);

    // console.log("current ");
    // const handleCurrentButton = (button) => {
    //     ;
    // };

    return (
        <div className="pagination-container">
            <span
                className={`${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => setCurrentButton(prev => prev <= 1 ? prev : prev - 1)}
            >
                <IoIosArrowBack />
            </span>

            {arrOfCurrButtons.map(((item, index) => {
                return <span key={index}
                    className={`${currentPage === item ? 'active' : ''}`} onClick={() => setCurrentButton(item)}
                >
                    {item}
                </span>
            }))}

            <span
                className={`${currentPage === numberOfPages.length ? 'disabled' : ''}`}
                onClick={() => setCurrentButton(prev => prev >= numberOfPages.length ? prev : prev + 1)}
            >
                <IoIosArrowForward />
            </span>
        </div>
    );
}


export default Pagination
