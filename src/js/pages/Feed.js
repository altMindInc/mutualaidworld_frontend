/*** IMPORTS ***/
// Module imports
import React, { Component } from "react"
import Cookies from "js-cookie"

// Component
import Page from "./Page"
import Main from "../components/Main"
import Scenario from "../components/Scenario"
import Loader from "../components/Loader"
import Thanks from "../components/Thanks"

// Footer
import Footer from "../components/Footer"

// Local JS Utilities
import Database from "../resources/Database"
import { moneyfy } from "../resources/Util"
/*** [end of imports] ***/

export default class Feed extends Component {
  constructor(props) {
    super(props)

    this.state = {
      scenarioData: null,
      feedOffset: 0,
      resultsOffset: 0,
      cardsOnPage: null,
      userId: Cookies.get("userId") || 1,
      previewDismissed: false,
      type: this.props.match.params.type || 1,
      sessionTotal: null,
      perSwipeAmount: null,
      donatedTotal: 0.0,
      overlayOpen: false
    }
  }

  filterFeed = (result,offset) => {
    // This function filters and sorts the missions into approriate feed order and count:
    let data = result.body.data;
    let tosort = [];
    // First find all of the actual scenarios:
    for (let dataIter in data) {
      let r = data[dataIter];
      let isValid = true;
      if (r.attributes.parent_scenario_id != null) {
        isValid = false;
      }

      // TODO: ( use type === "donator"/"doer" ) to adjust who sees funded/unfunded projects
      let isFullyFunded = ((1 * r.attributes.donated) >= (1 * r.attributes.funding_goal));
      if (this.state.type == "donator") {
        if (isFullyFunded) {
          isValid = false;
        }
      }
      if (this.state.type == "doer") {
        if (!isFullyFunded) {
          isValid = false;
        }
      }
      if (this.state.type == "verifier") {
        if (!r.attributes.is_complete) {
          isValid = false;
        }
      } else {
        // for everyone other than verifiers, don't show completed missions:
        if (r.attributes.is_complete) {
          isValid = false;
        }
      }
      if (isValid) {
        tosort.push(r);
      }
    }
    // Now sort by date created: (TODO: sort by relevance and date):
    tosort.sort((a,b) => ( 
      Date.parse( b.attributes.created_at ) -  Date.parse( a.attributes.created_at )
    ));
    // Now put top three (after offset) into the results:
    if (offset >= tosort.length) {
      offset %= tosort.length;
    }
    let betterList = [];
    for (let sortedIter in tosort) {
      if ((sortedIter >= offset) && (betterList.length < 3)) {
        betterList.push(tosort[sortedIter]);
      }
    }
    // Replace the output list with this better list:
    result.body.data = betterList;
  }

  componentDidMount = () => {
    this.mountFeedScenarios()
    this.mountUserData()
  }
  mountFeedScenarios = () => {
    Database.scenarioFeed()
      .then(result => {
        this.filterFeed(result, 0);
        const { data } = result.body
        // console.info("Database call complete:", data)

        this.setState({
          scenarioData: data,
          cardsOnPage: data.length
        })
      })
      .catch(error => {
        // console.error("Error getting scenarios:", error)
        this.setState({
          feedOffset: 0,
          scenarioData: null,
          cardsOnPage: null
        })
      })
  }
  mountUserData = () => {
    Database.getUserById({ id: this.state.userId })
      .then(result => {
        // console.log("User successfully found:", result)
        this.setState({
          sessionTotal:
            result.body.data.attributes.default_total_session_donation,
          perSwipeAmount: result.body.data.attributes.default_swipe_donation
        })
      })
      .catch(error => {
        // console.error("Error getting user:", error)
        this.setState({
          sessionTotal: null,
          perSwipeAmount: null
        })
      })
  }

  nextItem = params => {
    const {
      feedOffset,
      resultsOffset,
      // scenarioData,
      perSwipeAmount,
      donatedTotal,
      cardsOnPage
    } = this.state
    const { directionSwiped, fullFundAmount } = params

    if (cardsOnPage === 1) {
      Database.nextInFeed()
        .then(result => {
          this.filterFeed(result, resultsOffset + 3);
          const { data } = result.body
          // console.info("Next in feed call complete:", data)

          this.setState({
            feedOffset: 0,
            resultsOffset: resultsOffset + 3,
            scenarioData: data,
            cardsOnPage: 3
          })
          if (directionSwiped === "right") {
            this.setState({
              donatedTotal: donatedTotal + perSwipeAmount
            })
          } else if (directionSwiped === "up") {
            this.setState({
              donatedTotal: donatedTotal + fullFundAmount,
              overlayOpen: true
            })
          }
        })
        .catch(error => {
          // console.error("Error getting scenarios:", error)
          this.setState({
            feedOffset: 0,
            scenarioData: null
          })
        })
    } else {
      this.setState({
        feedOffset: feedOffset + 1,
        cardsOnPage: cardsOnPage - 1
      })
      if (directionSwiped === "right") {
        this.setState({
          donatedTotal: donatedTotal + perSwipeAmount
        })
      } else if (directionSwiped === "up") {
        this.setState({
          donatedTotal: donatedTotal + fullFundAmount,
          overlayOpen: true
        })
      }
    }
  }
  dismissPreview = () => {
    this.setState({
      previewDismissed: true
    })
  }
  dismissOverlay = () => {
    this.setState({
      overlayOpen: false
    })
  }

  doerPageRoute = scenarioId => {
    this.props.history.push(`/${scenarioId}/doer/Instructions`)
  }

  render() {
    const {
      scenarioData,
      feedOffset,
      previewDismissed,
      type,
      sessionTotal,
      donatedTotal,
      perSwipeAmount,
      overlayOpen
    } = this.state

    return (
      <Page clas={`feed-page ${type}-feed`}>
        <Thanks open={overlayOpen} dismiss={this.dismissOverlay} />
        <Main>
          <section className={`scenario-feed-wrap ${type}-feed-wrap`}>
            {scenarioData ? (
              scenarioData.map((scenario, index) => {
                if (index === feedOffset) {
                  return (
                    <Scenario
                      key={scenario.id}
                      scenario={scenario}
                      first
                      nextItem={this.nextItem}
                      previewDismissed={previewDismissed}
                      dismissPreview={this.dismissPreview}
                      feedType={type}
                      standardAmount={perSwipeAmount}
                      doerPageRoute={() => this.doerPageRoute(scenario.id)}
                    />
                  )
                } else if (index === feedOffset + 1) {
                  return (
                    <Scenario
                      key={scenario.id}
                      scenario={scenario}
                      second
                      nextItem={this.nextItem}
                      previewDismissed={previewDismissed}
                      dismissPreview={this.dismissPreview}
                      feedType={type}
                      standardAmount={perSwipeAmount}
                      doerPageRoute={this.doerPageRoute}
                    />
                  )
                } else if (index > feedOffset + 1) {
                  return (
                    <Scenario
                      key={scenario.id}
                      scenario={scenario}
                      feedType={type}
                      doerPageRoute={this.doerPageRoute}
                    />
                  )
                }
              })
            ) : (
              <Loader />
            )}
          </section>
        </Main>

        {type === "donator" && (
          <Footer>
            <div className="footer-left">
              <div className="dollar-amount">
                {sessionTotal ? moneyfy(sessionTotal) : "0"}
              </div>
              <h4 className="dollar-amount-label">To spend</h4>
            </div>
            <div className="footer-right">
              <div className="dollar-amount">
                {donatedTotal ? moneyfy(donatedTotal) : "0"}
              </div>
              <h4 className="dollar-amount-label">Donated</h4>
            </div>
          </Footer>
        )}
      </Page>
    )
  }
}
