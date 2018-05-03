/*** IMPORTS ***/
// Module imports
import React, { Component } from "react"
import { Link } from "react-router-dom"
import Icon from "@fortawesome/react-fontawesome"
import { faChevronRight } from "@fortawesome/fontawesome-free-solid"

// Page elements
import Page from "./Page"
import Main from "../components/Main"
import Footer from "../components/Footer"
import SessionSetting from "../components/SessionSetting"

// Utilities
import { gradientStyle } from "../resources/Util"
/*** [end of imports] ***/

export default class DoerFlow extends Component {
  constructor(props) {
    super(props)

    this.state = {
      timeFrame: "urgent", // "urgent" || "semi-urgent" || "important"
      workFromHome: true,
      workAbroad: false,
      workDistance: 40,
      distanceMax: 1000
    }

    this.setTimeframe = this.setTimeframe.bind(this)
    this.toggleWorkFromHome = this.toggleWorkFromHome.bind(this)
    this.toggleWorkAbroad = this.toggleWorkAbroad.bind(this)
    this.setWorkdistance = this.setWorkdistance.bind(this)
  }

  setTimeframe = timeFrame => {
    this.setState({
      timeFrame
    })
  }
  toggleWorkFromHome = () => {
    this.setState({
      workFromHome: !this.state.workFromHome
    })
  }
  toggleWorkAbroad = () => {
    this.setState({
      workAbroad: !this.state.workAbroad
    })
  }
  setWorkdistance = e => {
    const workDistance = e.target.value

    this.setState({
      workDistance
    })

    return workDistance
  }

  render() {
    const {
      timeFrame,
      workFromHome,
      workAbroad,
      workDistance,
      distanceMax
    } = this.state

    let sliderStyle = gradientStyle({
      dividend: workDistance,
      divisor: distanceMax,
      startColor: "#f39c12",
      endColor: "rgba(0, 0, 0, 0.1)"
    })

    return (
      <Page clas="flow-page doer-flow-page">
        <Main>
          <SessionSetting headerLabel="Jobs I want to do">
            <article className="card trending-card">
              <h4 className="card-title">Select from trending jobs</h4>
              <ul className="tag-list">
                <li className="tag inactive-tag">#Painting</li>
                <li className="tag active-tag">#Roofing</li>
                <li className="tag inactive-tag">#Transport</li>
                <li className="tag inactive-tag">#Coding</li>
                <li className="tag inactive-tag">#FirstAid</li>
                <li className="tag inactive-tag">#Childcare</li>
              </ul>
            </article>
          </SessionSetting>

          <SessionSetting headerLabel="Time frame" clas="timeframe-settings">
            <article
              className={
                timeFrame === "urgent"
                  ? "card btn-card active"
                  : "card btn-card"
              }
              onClick={() => this.setTimeframe("urgent")}
            >
              <h4>Urgent Jobs (next 24 hours)</h4>
            </article>
            <article
              className={
                timeFrame === "semi-urgent"
                  ? "card btn-card active"
                  : "card btn-card"
              }
              onClick={() => this.setTimeframe("semi-urgent")}
            >
              <h4>Semi-Urgent Jobs (next 1-2 days)</h4>
            </article>
            <article
              className={
                timeFrame === "important"
                  ? "card btn-card active"
                  : "card btn-card"
              }
              onClick={() => this.setTimeframe("important")}
            >
              <h4>Important Jobs (within the next week)</h4>
            </article>
          </SessionSetting>

          <SessionSetting headerLabel="Location" clas="location-settings">
            <article className="card">
              <div className="card-area location-city">
                <div className="location-label">Location</div>
                <div className="location-current">Pearlington, MI</div>
                <div className="location-icon">
                  <Icon icon={faChevronRight} />
                </div>
              </div>
              <div className="card-area home-and-abroad-toggle">
                <div className="toggle-row">
                  <div className="toggle-label">I want to work from home</div>
                  <div
                    className={workFromHome ? "toggle on" : "toggle"}
                    onClick={() => this.toggleWorkFromHome()}
                  >
                    <div className="toggle-button" />
                  </div>
                </div>
                <div className="toggle-row">
                  <div className="toggle-label">I'm willing to travel</div>
                  <div
                    className={workAbroad ? "toggle on" : "toggle"}
                    onClick={() => this.toggleWorkAbroad()}
                  >
                    <div className="toggle-button" />
                  </div>
                </div>
              </div>
              <div
                className={
                  workAbroad
                    ? "card-area travel-distance"
                    : "card-area travel-distance disabled-card-area"
                }
              >
                <div className="travel-range-title">Distance I can travel</div>
                <label
                  className="travel-range-label range-label"
                  htmlFor="travelDistanceSlider"
                >
                  {workDistance}km
                </label>
                <input
                  type="range"
                  className="range-slider"
                  id="travelDistanceSlider"
                  min="0"
                  max={distanceMax}
                  step="10"
                  value={workDistance}
                  onChange={e => this.setWorkdistance(e)}
                  style={sliderStyle}
                />
              </div>
            </article>
          </SessionSetting>
        </Main>

        <Footer>
          <Link to="/feed/doer" className="btn footer-btn feed-btn">
            View Missions
          </Link>
        </Footer>
      </Page>
    )
  }
}
