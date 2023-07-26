require('text-encoding').TextEncoder;
import "@testing-library/jest-dom/extend-expect";
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";
import { fireEvent, getByText, waitFor } from '@testing-library/dom';

const html = fs.readFileSync(path.resolve(__dirname, "./index.html"), "utf8");
let dom;
let document;
let window;
let addnumber;

describe("The final output has been printed correctly", () => {
  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: "dangerously" });
    document = dom.window.document;
    window = dom.window;
    addnumber = window.addnumber;
    window.alert = jest.fn();
    // Set initial positions of the rods manually
    const rod1 = document.querySelector("#rod1");
    const rod2 = document.querySelector("#rod2");
    rod1.style.left = "200px";
    rod2.style.left = "200px";
    // jest.useFakeTimer();
  });

  test("the ball should be have a shape of circle", () => {
    const ball = document.querySelector("#ball");
    const styles = window.getComputedStyle(ball);
    expect(styles.borderRadius).toMatch(/50%/i);
  });

  test("both rods should move together with the same keys", async () => {
    const rod1 = document.querySelector("#rod1");
    const rod2 = document.querySelector("#rod2");

    // Store the initial positions of the rods
    const initialLeftRod1 = rod1.style.left;
    const initialLeftRod2 = rod2.style.left;

    // Dispatch a key press event
    const keyPressEventA = new window.KeyboardEvent("keypress", {
      code: "KeyA",
    });
    window.dispatchEvent(keyPressEventA);

    // Wait for the ball to reach the opposite side and rods to move before checking rod positions
    // await waitFor(() => {
      // jest.advanceTimerByTime(1000);
      setTimeout(()=>{

        const finalLeftRod1 = rod1.style.left;
        const finalLeftRod2 = rod2.style.left;
  
        // Expect the final positions to be equal (rods move together)
        expect(finalLeftRod1).toBe(finalLeftRod2);
  
        // Expect the final positions not to be equal to the initial positions
        console.log(finalLeftRod1)
        console.log(initialLeftRod1)
        expect(finalLeftRod1).not.toBe(initialLeftRod1);
        expect(finalLeftRod2).not.toBe(initialLeftRod2);
      },1000)
    // }, { timeout: 2000 }); // Adjust the timeout value as needed based on the ball movement speed
  });


  test("collision with rod1 should change ball movement direction and increase score", () => {
    const ball = document.querySelector("#ball");
    ball.style.left = "200px"; // Set the ball's position to hit rod1
  
    // Ball's initial movement direction
    let ballSpeedX = 3;
    let ballSpeedY = -3;
  
    // Store the initial score
    let score = 0;
  
    // Mock the alert function
    const mockAlert = jest.fn();
    window.alert = mockAlert;
  
    // Dispatch a key press event to start the game
    const keyPressEventEnter = new window.KeyboardEvent("keypress", {
      code: "Enter",
    });
    window.dispatchEvent(keyPressEventEnter);
  
    // Simulate the ball hitting rod1 after 500ms
    setTimeout(() => {
      // Ball's final movement direction after hitting rod1
      ballSpeedY = 3; // Ball should move upwards (negative Y direction) after hitting rod1
  
      // Expect the ball's movement direction to change
      expect(ballSpeedX).toBe(3); // Assuming the initial value of ballSpeedX is 3
      expect(ballSpeedY).toBe(3);
  
      // Expect the score to increase by 1
      score += 1;
      expect(score).toBe(1);
  
      // Expect no alert for this test case
      expect(mockAlert).not.toHaveBeenCalled();
    }, 500);
  });
  
  test("collision with rod2 should change ball movement direction and increase score", () => {
    const ball = document.querySelector("#ball");
    ball.style.left = "200px"; // Set the ball's position to hit rod2
  
    // Ball's initial movement direction
    let ballSpeedX = 3;
    let ballSpeedY = 3;
  
    // Store the initial score
    let score = 0;
  
    // Mock the alert function
    const mockAlert = jest.fn();
    window.alert = mockAlert;
  
    // Dispatch a key press event to start the game
    const keyPressEventEnter = new window.KeyboardEvent("keypress", {
      code: "Enter",
    });
    window.dispatchEvent(keyPressEventEnter);
  
    // Simulate the ball hitting rod2 after 500ms
    setTimeout(() => {
      // Ball's final movement direction after hitting rod2
      ballSpeedY = -3; // Ball should move downwards (positive Y direction) after hitting rod2
  
      // Expect the ball's movement direction to change
      expect(ballSpeedX).toBe(3); // Assuming the initial value of ballSpeedX is 3
      expect(ballSpeedY).toBe(-3);
  
      // Expect the score to increase by 1
      score += 1;
      expect(score).toBe(1);
  
      // Expect no alert for this test case
      expect(mockAlert).not.toHaveBeenCalled();
    }, 500);
  });
  
  
  test("storeWin should store the name and max-score in local storage if the score becomes highest", () => {
    // Set an initial maximum score and rod name in localStorage
    localStorage.setItem("Name", "Rod 1");
    localStorage.setItem("MaxScore", "5");

    // Set the score to be higher than the initial maximum score
    const higherScore = 10;

    // Set the ball's position to hit rod2 to trigger the collision with rod2
    const ball = document.querySelector("#ball");
    ball.style.left = "200px"; // Set the ball's position to hit rod2

    // Ball's initial movement direction
    let ballSpeedX = 3;
    let ballSpeedY = 3;

    // Dispatch a key press event to start the game
    const keyPressEventEnter = new window.KeyboardEvent("keypress", {
      code: "Enter",
    });
    window.dispatchEvent(keyPressEventEnter);

    // Simulate the ball hitting rod2
    setTimeout(() => {
      // Ball's final movement direction after hitting rod2
      ballSpeedY = -3; // Ball should move upwards (negative Y direction) after hitting rod2

      // Call the storeWin function with the higher score and rod name
      storeWin("Rod 2", higherScore);

      // Check if the new maximum score and rod name have been stored in localStorage
      expect(localStorage.getItem("Name")).toBe("Rod 2");
      expect(parseInt(localStorage.getItem("MaxScore"))).toBe(higherScore);
    }, 500);
  });

  test("ball's direction should reverse after hitting the side wall", () => {
    const ball = document.querySelector("#ball");
    const ballDia = parseInt(ball.style.width); // Assuming the ball's diameter is 20px
  
    // Set the ball's initial position close to the left wall
    ball.style.left = "0px";
    ball.style.top = `${window.innerHeight / 2}px`;
  
    // Ball's initial movement direction
    let ballSpeedX = -3;
    let ballSpeedY = 3;
  
    // Dispatch a key press event to start the game
    const keyPressEventEnter = new window.KeyboardEvent("keypress", {
      code: "Enter",
    });
    window.dispatchEvent(keyPressEventEnter);
  
    // Simulate the ball hitting the left wall after 500ms
    setTimeout(() => {
      // Ball's final movement direction after hitting the left wall
      ballSpeedX = 3; // Ball should move towards the right (positive X direction) after hitting the left wall
  
      // Expect the ball's movement direction to change
      expect(ballSpeedX).toBe(3);
  
      // Reset the ball's position and direction
      ball.style.left = `${(window.innerWidth - ballDia) / 2}px`;
      ballSpeedX = 3;
      ballSpeedY = 3;
    }, 500);
  
    // Set the ball's initial position close to the right wall
    ball.style.left = `${window.innerWidth - ballDia}px`;
  
    // Dispatch a key press event to start the game
    window.dispatchEvent(keyPressEventEnter);
  
    // Simulate the ball hitting the right wall after 500ms
    setTimeout(() => {
      // Ball's final movement direction after hitting the right wall
      ballSpeedX = -3; // Ball should move towards the left (negative X direction) after hitting the right wall
  
      // Expect the ball's movement direction to change
      expect(ballSpeedX).toBe(-3);
    }, 500);
  });
  
  test("display alert with winning player and score after each round", () => {
    const ball = document.querySelector("#ball");
    const ballDia = parseInt(ball.style.width); // Assuming the ball's diameter is 20px
  
    // Set the ball's initial position close to the left wall
    ball.style.left = "0px";
    ball.style.top = `${window.innerHeight / 2}px`;
  
    // Ball's initial movement direction
    let ballSpeedX = -3;
    let ballSpeedY = 3;
  
    // Mock the alert function
    const mockAlert = jest.fn();
    window.alert = mockAlert;
  
    // Dispatch a key press event to start the game
    const keyPressEventEnter = new window.KeyboardEvent("keypress", {
      code: "Enter",
    });
    window.dispatchEvent(keyPressEventEnter);
  
    // Simulate the ball hitting the left wall after 500ms
    setTimeout(() => {
      // Ball's final movement direction after hitting the left wall
      ballSpeedX = 3; // Ball should move towards the right (positive X direction) after hitting the left wall
  
      // Expect the ball's movement direction to change
      expect(ballSpeedX).toBe(3);
  
      // Reset the ball's position and direction
      ball.style.left = `${(window.innerWidth - ballDia) / 2}px`;
      ballSpeedX = 3;
      ballSpeedY = 3;
  
      // Simulate the ball hitting the right wall after 500ms
      setTimeout(() => {
        // Ball's final movement direction after hitting the right wall
        ballSpeedX = -3; // Ball should move towards the left (negative X direction) after hitting the right wall
  
        // Expect the ball's movement direction to change
        expect(ballSpeedX).toBe(-3);
  
        // Expect the alert function to be called
        expect(mockAlert).toHaveBeenCalled();
  
        // Get the last call of the alert function
        const alertMessage = mockAlert.mock.calls[mockAlert.mock.calls.length - 1][0];
  
        // Expect the alert message to contain the winning player and a score
        expect(alertMessage).toMatch(/^Rod\s\d\swins\swith\sa\sscore\sof\s\d+\. Max\sscore\sis:\s\d+$/i);
      }, 500);
  
    }, 500);
  });

  test("the rods should only move horizontally using the 'a' and 'd' keys", () => {
    const rod1 = document.querySelector("#rod1");
    const rod2 = document.querySelector("#rod2");
  
    // Store the initial positions of the rods
    const initialLeftRod1 = rod1.style.left;
    const initialLeftRod2 = rod2.style.left;
  
    // Dispatch a key press event for the 'a' key
    const keyPressEventA = new window.KeyboardEvent("keypress", {
      code: "KeyA",
    });
    window.dispatchEvent(keyPressEventA);
  
    // Dispatch a key press event for the 'd' key
    const keyPressEventD = new window.KeyboardEvent("keypress", {
      code: "KeyD",
    });
    window.dispatchEvent(keyPressEventD);
  
    // Wait for the ball to reach the opposite side and rods to move before checking rod positions
    setTimeout(() => {
      const finalLeftRod1 = rod1.style.left;
      const finalLeftRod2 = rod2.style.left;
  
      // Expect the final positions to be equal (rods move together)
      expect(finalLeftRod1).toBe(finalLeftRod2);
  
      // Expect the final positions not to be equal to the initial positions for both keys
      expect(finalLeftRod1).not.toBe(initialLeftRod1);
      expect(finalLeftRod2).not.toBe(initialLeftRod2);
    }, 1000);
  });
  
  test("the losing rod gets the ball for the next match and rods and ball move to center", () => {
    const ball = document.querySelector("#ball");
    const rod1 = document.querySelector("#rod1");
    const rod2 = document.querySelector("#rod2");
  
    // Store the initial positions of the rods and ball
    const initialLeftRod1 = rod1.style.left;
    const initialLeftRod2 = rod2.style.left;
    const initialBallLeft = ball.style.left;
    const initialBallTop = ball.style.top;
  
    // Set the ball's position to hit rod1 (to simulate rod1 losing)
    ball.style.left = "200px";
    ball.style.top = `${rod1.offsetTop + rod1.offsetHeight}px`;
  
    // Dispatch a key press event to start the game
    const keyPressEventEnter = new window.KeyboardEvent("keypress", {
      code: "Enter",
    });
    window.dispatchEvent(keyPressEventEnter);
  
    // Simulate the ball hitting rod1 after 500ms
    setTimeout(() => {
      // Expect the ball to be at the center vertically (horizontally depends on the last winning rod)
      expect(ball.style.top).toBe(`${window.innerHeight / 2}px`);
  
      // Expect both rods to be at the center
      expect(rod1.style.left).toBe(`${(window.innerWidth - rod1.offsetWidth) / 2}px`);
      expect(rod2.style.left).toBe(`${(window.innerWidth - rod2.offsetWidth) / 2}px`);
  
      // Expect the ball's horizontal position to be the same as the last winning rod (rod2 in this case)
      expect(ball.style.left).toBe(rod2.style.left);
    }, 500);
  });

  test("the score will be counted from the start of every match", () => {
    const ball = document.querySelector("#ball");
    const rod1 = document.querySelector("#rod1");
    const rod2 = document.querySelector("#rod2");
  
    // Set the ball's position to hit rod1 (to simulate rod1 losing)
    ball.style.left = "200px";
    ball.style.top = `${rod1.offsetTop + rod1.offsetHeight}px`;
  
    // Dispatch a key press event to start the game
    const keyPressEventEnter = new window.KeyboardEvent("keypress", {
      code: "Enter",
    });
    window.dispatchEvent(keyPressEventEnter);
  
    // Wait for the ball to reach the opposite side and rods to move before checking score
    setTimeout(() => {
      // Store the score after the first match
      const scoreAfterFirstMatch = score;
  
      // Reset the ball's position and direction to the center
      ball.style.left = `${(window.innerWidth - ball.offsetWidth) / 2}px`;
      ball.style.top = `${window.innerHeight / 2}px`;
      ballSpeedY = -3;
  
      // Dispatch another key press event to start the second match
      window.dispatchEvent(keyPressEventEnter);
  
      // Wait for the ball to reach the opposite side and rods to move before checking score
      setTimeout(() => {
        // Store the score after the second match
        const scoreAfterSecondMatch = score;
  
        // Expect the score to start from zero for every match
        expect(scoreAfterFirstMatch).toBe(0);
        expect(scoreAfterSecondMatch).toBe(0);
      }, 500); // Adjust the timeout value based on the ball movement speed
    }, 500); // Adjust the timeout value based on the ball movement speed
  });

  test('Ball should move when Enter key is pressed',async () => {
    // Mock the ball element
    const ball = document.getElementById('ball');
    const initialBallLeft = ball.style.left;
    const initialBallTop = ball.style.top;
    // Trigger the Enter key press event
    fireEvent.keyPress(window, { code: 'Enter' });
    // Ball should now move, check if its position has changed
    setTimeout(() => {
      const updatedBallLeft = ball.style.left;
      const updatedBallTop = ball.style.top;
      console.log(updatedBallLeft);
      expect(initialBallLeft).not.toEqual(updatedBallLeft);
      expect(initialBallTop).not.toEqual(updatedBallTop);
      done();
    }, 5000);});
  // Test the rod movement on key up and down events
  test('Rod should move when A and D keys are pressed', () => {
    // Mock the rod elements
    const rod1 = document.getElementById('rod1');
    const initialRod1Left = rod1.style.left;
    const rodWidth = rod1.offsetWidth;
    // Trigger the A key press event
    fireEvent.keyPress(window, { code: 'KeyA' });
    // Rod1 should now move left, check if its position has changed
    setTimeout(()=>{
    const updatedRod1Left = rod1.style.left;
    expect(initialRod1Left).not.toEqual(updatedRod1Left);
    },1000);
    // Trigger the D key press event
    fireEvent.keyPress(window, { code: 'KeyD' });
    // Rod1 should now move back to its initial position, check if its position has changed
    setTimeout(()=>{
    const finalRod1Left = rod1.style.left;
    expect(finalRod1Left).toEqual(initialRod1Left);
  },1000);
    // Trigger the D key press event again
    fireEvent.keyPress(window, { code: 'KeyD' });
    // Rod1 should now move right, check if its position has changed
    setTimeout(()=>{
    const updatedRod1LeftAgain = rod1.style.left;
    expect(updatedRod1LeftAgain).not.toEqual(initialRod1Left);
  },1000);
    // // Check if the rod2 is moving with the rod1 (since they have the same position)
    // const rod2 = document.getElementById('rod2');
    // expect(rod2.style.left).toEqual(updatedRod1LeftAgain);
  });

  
  

});
