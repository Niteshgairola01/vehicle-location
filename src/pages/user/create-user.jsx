import React, { useEffect, useState } from 'react'
import Card from '../../components/Card/card'
import { Input } from '../../components/form/Input'
import { Col, Form, Row } from 'react-bootstrap'
import Button from '../../components/Button/hoveredButton'
import CButton from '../../components/Button/coloredButton'
import { getAllOfficesList } from '../../hooks/officeMasterHooks'
import { ErrorToast, SuccessToast } from '../../components/toast/toast';

import { BiSolidHide } from "react-icons/bi";
import { BiSolidShow } from "react-icons/bi";
import { createNewUser, getUsersList, updateUser } from '../../hooks/authHooks'

const CreateUser = () => {

    const [form, setForm] = useState({});
    const [pass, setPass] = useState('');

    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [createdBy, setCreatedBy] = useState('');

    const [offices, setOffices] = useState([]);
    const [selectedOffice, setSelectedOffice] = useState('');
    const [searchUser, setSearchUser] = useState('');
    const [selectedUser, setSelectedUser] = useState({});

    const [showUsersList, setShowUsersList] = useState(false);
    const [showOfficesList, setShowOfficesList] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const usersList = [
        {
            userName: 'user1',
            userId: 'PAPL00',
            createdBy: 'Admin',
            office: 'Jaipur',
            password: '1234'
        },
        {
            userName: 'user2',
            userId: 'PAPL01',
            createdBy: 'Admin',
            office: 'Jaipur',
            password: '1234'
        },
    ];

    useEffect(() => {
        setUserName(selectedUser?.userName);
        setUserId(selectedUser?.userId);
        setPassword(selectedUser?.password);
        setCreatedBy(selectedUser?.createdBy);
        setSelectedOffice(selectedUser?.office);

        setForm({
            ...form,
            password: selectedUser?.password
        });
    }, [selectedUser]);

    useEffect(() => {
        setForm({
            ...form,
            username: userName,
            userId,
            password: password === '' ? pass : password,
            createdBy,
            office: selectedOffice
        })
    }, [userName, userId, pass, createdBy, selectedOffice]);

    useEffect(() => {
        getAllOfficesList().then((response) => {
            console.log("response", response);
            (response.status === 200) ? setOffices(response?.data) : setOffices([]);
        }).catch(() => setOffices([]));
    }, []);

    // useEffect(() => {
    //     getUsersList().then((response) => {
    //         (response.status === 200) ? setUsers(response?.data) : setUsers([]);
    //     }).catch(() => setUsers([]));
    // }, []);

    const handleChangeOfficeValue = (e) => {
        setSelectedOffice(e.target.value);
        setShowOfficesList(true);
    };

    const handleSelecteOffice = (office) => {
        setSelectedOffice(office?.officeName);
        setForm({
            ...form,
            office: office?.officeName
        })
    };

    const handleSelectUser = (user) => {
        setSearchUser(user?.userName);
        setSelectedUser(user);

        setForm({
            ...form,
            username: user?.userName
        });
    };

    const filteredOffices = offices.filter(data => data?.officeName.toLowerCase().includes(selectedOffice?.toLowerCase()));
    const filteredusers = usersList.filter(data => data?.userName.toLowerCase().includes(searchUser.toLowerCase()));

    const handleShowOptions = () => {
        showOfficesList && setShowOfficesList(false);
        showUsersList && setShowUsersList(false);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        SuccessToast("User created successfully");

        // if (selectedUser?.username === undefined) {
        //     createNewUser(form).then((response) => {
        //         if (response.status === 200) {
        //             SuccessToast("User created successfully");
        //         } else {
        //             ErrorToast("Unable to create user");
        //         }
        //     }).catch(err => err?.response?.data ? ErrorToast(err?.response?.data) : ErrorToast("Something went wrong"));
        // } else {
        //     updateUser(form).then((response) => {
        //         if (response.status === 200) {
        //             SuccessToast("User updated successfully");
        //         } else {
        //             ErrorToast("Unable to udpate user");
        //         }
        //     }).catch(err => err?.response?.data ? ErrorToast(err?.response?.data) : ErrorToast("Something went wrong"));
        // }
    };

    return (
        <div className='mx-5 my-3 px-5 pt-2 pb-5' onClick={() => handleShowOptions()}>
            <div className='w-100'>
                <h3 className='thm-dark'>Create User</h3>

                <hr />

                <div className='w-100 d-flex justify-content-center align-items-center flex-column create-user-main-container'>
                    <div className='create-user-inner-container'>
                        <Card>
                            <div className=' d-flex justify-content-between align-items-center user-form-header'>
                                <div className='m-0 p-0 position-relative'>
                                    <Form.Control type='search' className='inputfield' value={searchUser} onChange={(e) => setSearchUser(e.target.value)} onClick={() => setShowUsersList(true)} placeholder='Search User' style={{ fontSize: '0.8rem', width: "12rem" }} />

                                    {
                                        showUsersList ? (
                                            <div className='mt-1 px-2 polygons-list position-absolute bg-white' style={{ boxShadow: "0px 0px 10px 0px #c8c9ca", width: "100%", zIndex: '2' }} >
                                                {
                                                    filteredusers.map((data, index) => (
                                                        <div className={`p-0 cursor-pointer ${selectedOffice === data?.userName ? 'active-category' : 'category'} d-flex justify-content-between align-items-center`} key={index}>
                                                            <p className="m-0 p-0 py-2 ps-2 pe-5" onClick={() => handleSelectUser(data)}>
                                                                {data?.userName === null || data?.userName === '' ? '' : `${data?.userName}`}
                                                            </p>
                                                        </div>
                                                    ))
                                                }
                                                {
                                                    filteredusers.length === 0 ? (
                                                        <div className='w-100 py-2 text-center text-secondary'>
                                                            No user found
                                                        </div>
                                                    ) : null
                                                }
                                            </div>
                                        ) : null
                                    }
                                </div>

                                <Button className="ms-2 px-1">All users</Button>
                            </div>

                            <hr />

                            <Form className='w-100' onSubmit={handleSubmit}>
                                <Row>
                                    <Col sm={6} className='pe-2'>
                                        <Input label="Name" type='text' value={userName} name="userName" onChange={(e) => setUserName(e.target.value)} placeholder="Username" required={true} />
                                    </Col>
                                    <Col sm={6} className='ps-2'>
                                        <Input label="User Id" value={userId} placeholder="ID" disabled={true} />
                                    </Col>
                                    <Col sm={6} className='mt-1 pe-2 position-relative'>
                                        <Input label="Passowrd" type={showPassword ? 'text' : 'password'} value={password?.length > 0 ? '' : pass} name="password" onChange={(e) => {
                                            handleChange(e);
                                            setPass(e.target.value);
                                            setPassword('')
                                        }} placeholder="Password" required={true} />

                                        {
                                            pass.length > 0 ? (
                                                <span className='position-absolute bg-white my-1 px-2 cursor-pointer thm-dark' style={{ right: 9, top: 32 }}>
                                                    {
                                                        showPassword ? (
                                                            <BiSolidShow onClick={() => setShowPassword(false)} />
                                                        ) : (
                                                            <BiSolidHide onClick={() => setShowPassword(true)} />
                                                        )
                                                    }
                                                </span>
                                            ) : null
                                        }

                                    </Col>
                                    <Col sm={6} className='mt-1 ps-2'>
                                        <Input label="Created By" type='text' name="createdBy" value={createdBy} onChange={e => setCreatedBy(e.target.value)} placeholder="Created By" required={true} />
                                    </Col>
                                    <Col sm={6} className='position-relative mt-1 ps-2'>
                                        <Input type="text" label="Office" value={selectedOffice} onChange={handleChangeOfficeValue} onClick={() => setShowOfficesList(true)} placeholder="Office" required={true} />

                                        {
                                            showOfficesList ? (
                                                <div className='mt-1 px-2 polygons-list position-absolute bg-white' style={{ boxShadow: "0px 0px 10px 0px #c8c9ca", width: "95%", zIndex: '2' }} >
                                                    {
                                                        filteredOffices.map((data, index) => (
                                                            <div className={`p-0 cursor-pointer ${selectedOffice === data?.officeName ? 'active-category' : 'category'} d-flex justify-content-between align-items-center`} key={index}>
                                                                <p className="m-0 p-0 py-2 ps-2 pe-5" onClick={() => handleSelecteOffice(data)}>
                                                                    {data?.officeName === null || data?.officeName === '' ? '' : `${data?.officeName}`}
                                                                </p>
                                                            </div>
                                                        ))
                                                    }
                                                    {
                                                        filteredOffices.length === 0 ? (
                                                            <div className='w-100 text-center text-secondary'>
                                                                No office found
                                                            </div>
                                                        ) : null
                                                    }
                                                </div>
                                            ) : null
                                        }

                                    </Col>
                                </Row>
                                <hr />
                                <div className='w-100 d-flex justify-content-center align-items-center'>
                                    <CButton type="submit" className="py-1 px-5 w-50">Save</CButton>
                                </div>
                            </Form>
                        </Card>

                        <Card>
                            <div>
                                <h6 className="thm-dark">All users</h6>

                                <hr />

                                <div className='w-100 table-responsive' style={{ maxHeight: "25rem", }}>
                                    <table className='table w-100 position-relative' style={{ overflowX: "hidden", overflowY: "scroll" }}>
                                        <thead style={{ zIndex: 1, position: "sticky", top: 0 }}>
                                            <tr className='text-white'>
                                                <th className='ps-2' style={{ width: '7%' }}>S.No.</th>
                                                <th className='' style={{ width: '12%' }}>User Id</th>
                                                <th className=''>UserName</th>
                                                <th className=''>Office</th>
                                                <th className=''>Created By</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                usersList.map((data, index) => (
                                                    <tr className='bg-white' key={index}>
                                                        <td className='text-center py-2'>{index + 1}</td>
                                                        <td>{data?.userId}</td>
                                                        <td>{data?.userName}</td>
                                                        <td>{data?.office}</td>
                                                        <td>{data?.createdBy}</td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div >
        </div >
    )
}

export default CreateUser;
