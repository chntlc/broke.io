import React, { useCallback, useContext, useEffect, useState } from 'react'
import Modal from './Modal'
import '../css/Settings.css'
import { UserContext } from "./context/UserContext"
import { Link, NavLink } from "react-router-dom"
import { refreshUser, updateUser, userLogout, toggleSettingsModal } from "../features/globalSlice"
import { connect, useDispatch } from 'react-redux'

function Settings(props) {
  const dispatch = useDispatch()
  const [user, setUser] = useState({
    _id: props.user._id,
    fname: props.user.fname,
    lname: props.user.lname,
    budget: props.user.budget,
    username: props.user.username,
  })
  const [userContext, setUserContext] = useContext(UserContext)

  useEffect(() => {
    fetch('/users/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userContext.token}`,
      }
    })
      .then(res => res.json())
      .then(res => {
        console.log("This is the useEffect method.")
        console.log("This is the response: ", res)
        setUser(res)
        dispatch(refreshUser(res))
      });
  }, []);

  async function handleSettingChange(event) {
    event.preventDefault();

    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    console.log("password: ", password);
    console.log("password2: ", password2);

    if ( password !== password2) {
      alert("Password do not match!");
    } else {
      const _id = user._id;
      const fname = user.fname;
      const lname = user.lname;
      const budget = user.budget;
      const username = user.username;

      const updatedUser = {
        _id: _id,
        fname: fname,
        lname: lname,
        budget: budget,
        username: username,
        password: password
      };

      await fetch('/users/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      })
        .then(res => res.json())
        .then(res => {
          const user = res.updatedUser;
          console.log("Updated User: ", user);

          setUser(user);
          dispatch(updateUser(user));
          dispatch(toggleSettingsModal(''));
          alert('Settings Changed!');
        })
        .catch(err => {
          console.log(err);
          alert("Updating user failed! Please try again.");
          if (process.env.NODE_ENV !== "production") {
            window.location.replace("http://localhost:3000/dashboard");
          } else {
            window.location.replace("http://budgeto-app.herokuapp.com/dashboard");
          }
        });
    }
  }

  async function handleLogout(event) {
    event.preventDefault();

    await fetch('/users/logout', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userContext.token}`,
      },
    })
      .then(res => res.json())
      .then(res => {
        console.log("Response for /users/logout GET METHOD: ", res);
        setUserContext(oldValues => {
          return { ...oldValues, details: undefined, token: null }
        })
        const emptyUser = {
          _id: '',
          fname: '',
          lname: '',
          budget: 0,
          username: ''
        };
        setUser(emptyUser);
        dispatch(updateUser(emptyUser));
        dispatch(userLogout(emptyUser));
        window.localStorage.setItem("logout", Date.now());
        alert('Successfully Logged Out!');
        if (process.env.NODE_ENV !== "production") {
          window.location.replace("http://localhost:3000/");
        } else {
          window.location.replace("http://budgeto-app.herokuapp.com/");
        }
      })
      .catch(err => {
        console.log(err);
        alert("Logging out user failed! Please try again.");
        if (process.env.NODE_ENV !== "production") {
          window.location.replace("http://localhost:3000/");
        } else {
          window.location.replace("http://budgeto-app.herokuapp.com/");
        }
      });
    }

  const handleChange = (event) => {
    const { id, value } = event.target;

    setUser(prevUser => {
      return {
        ...prevUser,
        [id]: value
      };
    });
  }

  const redirectSettings = () => {
    dispatch(toggleSettingsModal('settings'))
  }

  const redirectLogout = () => {
    dispatch(toggleSettingsModal('logout'))
  }

  const closeSettingsModal = () => {
    dispatch(toggleSettingsModal(''))
  }

  const profileForm =
    <form className='settings-form'>
      <label>First Name</label>
      <input type="text" id="fname" value={user.fname} onChange={handleChange}/>
      <label>Last Name</label>
      <input type="text" id="lname" value={user.lname} onChange={handleChange}/>
      <label>Budget</label>
      <input type="number" id="budget" value={user.budget} onChange={handleChange}/>
      <label>Email</label>
      <input type="email" id="email" value={user.username} onChange={handleChange}/>
      <label>Password</label>
      <input type="password" id="password"/>
      <label>Confirm Password</label>
      <input type="password" id="password2"/>
      <button className="settings-submit-button" onClick={handleSettingChange}>Confirm</button>
    </form>

  const logoutForm =
    <form className='logout-form'>
      <div className='logout-submit-button-wrapper'>
        <NavLink to='/' className='logout-submit-link'>
          <button className='logout-submit-button' onClick={handleLogout}>LOGOUT!</button>
        </NavLink>
      </div>
    </form>

  return (
    <Modal
      header={(<React.Fragment>
        <button id='settings-header' className={props.showSettings === 'settings' ? 'underline-label' : ''} onClick={redirectSettings}>SETTINGS</button>
        <span>&nbsp;/&nbsp;</span>
        <button id='logout-header' className={props.showSettings === 'logout' ? 'underline-label' : ''} onClick={redirectLogout}>LOGOUT</button>
      </React.Fragment>)}
      content={props.showSettings === "settings" ? profileForm : logoutForm}
      onClose={closeSettingsModal}
    >
    </Modal>
  )
}

const mapStateToProps = (state) => {
  return {
    showSettings: state.global.showSettingsModal,
    user: state.global.user
  }
}

export default connect(mapStateToProps)(Settings);
