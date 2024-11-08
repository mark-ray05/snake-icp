import Nat8 "mo:base/Nat8";
import Blob "mo:base/Blob";
import Array "mo:base/Array";

actor {
  let SubnetManager : actor {
    raw_rand() : async Blob;
  } = actor "aaaaa-aa"; // The management canister for randomness

  public func play_rps(userChoice: Text) : async Text {
    let choices = ["Rock", "Paper", "Scissors"];

    // 使用 Array.find 来检查用户选择是否有效
    if (Array.find<Text>(choices, func(c) { c == userChoice }) == null) {
      return "Please choose either Rock, Paper, or Scissors.";
    };

    // Fetch raw random bytes for computer's choice
    let randomBlob = await SubnetManager.raw_rand();
    let randomBytes : [Nat8] = Blob.toArray(randomBlob);

    if (Array.size(randomBytes) == 0) {
      return "Failed to generate random choice. Please try again.";
    };

    // Convert the random byte into an index to pick a choice for the computer
    let computerChoice = choices[Nat8.toNat(randomBytes[0]) % 3];

    // Determine the winner
    let result = if (userChoice == computerChoice) {
      "It's a tie! Both chose " # userChoice # "."
    } else if (
      (userChoice == "Rock" and computerChoice == "Scissors") or
      (userChoice == "Scissors" and computerChoice == "Paper") or
      (userChoice == "Paper" and computerChoice == "Rock")
    ) {
      "You win! Computer chose " # computerChoice # "."
    } else {
      "Computer wins! Computer chose " # computerChoice # "."
    };

    return result;
  };
};
