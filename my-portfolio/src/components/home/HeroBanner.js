import React from 'react'
import { Link } from 'react-router-dom'
import subject from './Subject.png';

export default function HeroBanner() {
  return (
    <section id="app-hero-section">
        <nav id="app-navbar">
            <Link to="#projects" className='app-navbar-links'>Home</Link>
            <Link to="#projects" className='app-navbar-links'>About</Link>
            <Link to="#projects" className='app-navbar-links'>Projects</Link>
            <Link to="#projects" className='app-navbar-links'>Linkedin</Link>
            <Link to="#projects" className='app-navbar-links'>Contact</Link>
        </nav>
        <div id="app-hero-banner">
            <div id="app-hero-banner_intro">
                <div id="app-hero-banner_hello">--- &nbsp;&nbsp;&nbsp;HELLO</div>
                <div id="app-hero-banner_name">
                    I'm <span>Akshit</span> Bansal
                </div>
                <div id="app-hero-banner_description">
                    I am software developer who loves to code. I like to read about new technologies and my favourite hobby is
                    to deep dive in tech.
                </div>
                <button id="app-hero-banner_download-cv">DOWNLOAD CV</button>
            </div>
            <div id="app-hero-banner_me">
                <img src={subject} width="550" height="750"/>
            </div>
        </div>
    </section>
  )
}
