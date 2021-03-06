import React from "react";

const SnackbarContext = React.createContext();

const defaultSnackbar = {
  autoHideDuration: 4000,
  message: "",
  open: false,
  type: "success",
};

class SnackbarProvider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...defaultSnackbar,
    };

    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this);
    this.handleShowSnackbar = this.handleShowSnackbar.bind(this);
  }

  handleCloseSnackbar() {
    return this.setState({ ...defaultSnackbar });
  }

  /**
   * Callback to update snackbar context provider.
   * snackbarProps should be valid props of Snackbar
   *
   * @param {autohideDuration, message, open, type} snackbarProps
   * @returns void
   * @memberof SnackbarProvider
   */
  handleShowSnackbar(snackbarProps) {
    return this.setState({ open: true, ...snackbarProps });
  }

  render() {
    return (
      <SnackbarContext.Provider
        value={{
          closeSnackbar: this.handleCloseSnackbar,
          show: this.handleShowSnackbar,
          snackbar: this.state,
        }}
      >
        {this.props.children}
      </SnackbarContext.Provider>
    );
  }
}

const SnackbarConsumer = SnackbarContext.Consumer;

export { SnackbarContext, SnackbarConsumer, SnackbarProvider };
