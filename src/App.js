import React from "react";
import Joi from "@hapi/joi";
import L from "leaflet";
import {
  Card,
  Button,
  CardTitle,
  CardText,
  Form,
  FormGroup,
  Label,
  Input
} from "reactstrap";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import userLocationURL from "./user_location.svg";
import messageLocationURL from "./message_location.svg";

import "./App.css";

const myIcon = L.icon({
  iconUrl: userLocationURL,
  iconSize: [50, 82]
});

const messageIcon = L.icon({
  iconUrl: messageLocationURL,
  iconSize: [50, 82]
});

const schema = Joi.object().keys({
  name: Joi.string()
    .min(1)
    .max(500)
    .required(),
  message: Joi.string()
    .min(1)
    .max(500)
    .required()
});

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/v1/messages"
    : "https://git.heroku.com/react-world-map.git/api/v1";

class App extends React.Component {
  state = {
    location: {
      lat: 51.505,
      lng: -0.09
    },
    haveUsersLocation: false,
    zoom: 2.5,
    userMessage: {
      name: "",
      message: ""
    },
    sendingMessage: false,
    sentMessage: false,
    messages: []
  };

  componentDidMount() {
    fetch(API_URL)
      .then(res => res.json())
      .then(messages => {
        const haveSeenLocation = {};
        messages = messages.reduce((all, message) => {
          const key = `${message.latitude.toFixed(
            3
          )}${message.longitude.toFixed(3)}`;
          if (haveSeenLocation[key]) {
            haveSeenLocation[key].otherMessages =
              haveSeenLocation[key].otherMessages || [];
            haveSeenLocation[key].otherMessages.push(message);
          } else {
            haveSeenLocation[key] = message;
            all.push(message);
          }
          return all;
        }, []);
        this.setState({
          messages
        });
      });
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          haveUsersLocation: true,
          zoom: 14
        });
        console.log(position);
      },
      () => {
        console.log("Error, the user did not provide a location");
        fetch("https://ipapi.co/json")
          .then(res => res.json())
          .then(location => {
            this.setState({
              location: {
                lat: location.latitude,
                lng: location.longitude
              },
              haveUsersLocation: true,
              zoom: 14
            });
          });
      }
    );
  }

  formIsValid = () => {
    const userMessage = {
      name: this.state.userMessage.name,
      message: this.state.userMessage.message
    };
    const result = Joi.validate(userMessage, schema);
    return !result.error && this.state.haveUsersLocation ? true : false;
  };

  formSubmitted = event => {
    event.preventDefault();
    console.log(this.state.userMessage);

    if (this.formIsValid()) {
      this.setState({
        sendingMessage: true
      });
      fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          name: this.state.userMessage.name,
          message: this.state.userMessage.message,
          latitude: this.state.location.lat,
          longitude: this.state.location.lng
        })
      })
        .then(res => res.json())
        .then(message => {
          console.log(message);
          setTimeout(() => {
            this.setState({
              sendingMessage: false,
              sentMessage: true
            });
          }, 4000);
        });
    }
  };

  valueChanged = event => {
    const { name, value } = event.target;
    this.setState(prevState => ({
      userMessage: {
        ...prevState.userMessage,
        [name]: value
      }
    }));
  };

  render() {
    const position = [this.state.location.lat, this.state.location.lng];
    return (
      <div className="map">
        <Map className="map" center={position} zoom={this.state.zoom}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {this.state.haveUsersLocation ? (
            <Marker position={position} icon={myIcon} />
          ) : (
            ""
          )}
          {this.state.messages.map(message => (
            <Marker
              key={message._id}
              position={[message.latitude, message.longitude]}
              icon={messageIcon}
            >
              <Popup>
                <p>
                  <em>{message.name}:</em>
                  {message.message}
                </p>
                {message.otherMessages
                  ? message.otherMessages.map(message => (
                      <p ket={message._id}>
                        <em>{message.name}:</em>
                        {message.message}
                      </p>
                    ))
                  : ""}
              </Popup>
            </Marker>
          ))}
        </Map>

        <Card body className="message-form">
          <CardTitle>Welcome to World Check In!</CardTitle>
          <CardText>Leave a message with your location!</CardText>
          <CardText>Thank for stopping by!</CardText>
          {!this.state.sendingMessage &&
          !this.state.sentMessage &&
          this.state.haveUsersLocation ? (
            <Form onSubmit={this.formSubmitted}>
              <FormGroup row>
                <Label for="name">Name</Label>
                <Input
                  onChange={this.valueChanged}
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Enter Your Name"
                />
              </FormGroup>
              <FormGroup row>
                <Label for="message">Message</Label>
                <Input
                  onChange={this.valueChanged}
                  type="textarea"
                  name="message"
                  id="message"
                  placeholder="Enter A Message"
                />
              </FormGroup>
              <Button type="submit" color="info" disabled={!this.formIsValid()}>
                Post
              </Button>{" "}
            </Form>
          ) : this.state.sendingMessage || !this.state.haveUsersLocation ? (
            <video
              autoPlay
              loop
              src="https://i.giphy.com/media/BCIRKxED2Y2JO/giphy.mp4"
            />
          ) : (
            <CardText>Thanks for sharing a message!</CardText>
          )}
        </Card>
      </div>
    );
  }
}

export default App;
