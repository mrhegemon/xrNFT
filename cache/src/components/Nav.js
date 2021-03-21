import React, { Fragment } from 'react';

const Nav = () => {
  return (
    <Fragment>
      <header className="nav">
        <span className="logo">
          <img
            src="/assets/HeaderLogo.png"
            alt="Logo"
            className="headerLogo"
            style={{padding:".6em"}}

          />
        </span>
      </header>
    </Fragment>
  );
};

export default Nav;