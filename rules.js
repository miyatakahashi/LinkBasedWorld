class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        // Initialize our flags storage
        this.engine.flags = {};
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);

        if (locationData.Choices) {
            let hasVisibleChoices = false;

            for (let choice of locationData.Choices) {
                // If this choice requires a key, check if the player has it
                if (choice.RequiresKey) {
                    if (!this.engine.flags[choice.RequiresKey]) {
                        // Player doesn't have the key — show a locked message instead
                        this.engine.show("🔒 <em>Your room. The door is locked. You need your roommate to let you in.</em>");
                        continue; // skip adding this choice button
                    }
                }
                this.engine.addChoice(choice.Text, choice);
                hasVisibleChoices = true;
            }

            if (!hasVisibleChoices) {
                this.engine.addChoice("The end.");
            }
        } else {
            this.engine.addChoice("The end.");
        }
    }

    handleChoice(choice) {
        if (choice) {
            this.engine.show("> " + choice.Text);

            // If this choice grants a key, save it to flags
            if (choice.GrantsKey) {
                this.engine.flags[choice.GrantsKey] = true;
            }

            let nextLocation = this.engine.storyData.Locations[choice.Target];

            if (nextLocation.Type === "Memory") {
                this.engine.gotoScene(MemoryLocation, choice.Target);
            } else if (nextLocation.Type === "RoommateEncounter") {
                this.engine.gotoScene(RoommateEncounter, choice.Target);
            } else if (nextLocation.Type === "RoommateConvince") {
                this.engine.gotoScene(RoommateConvince, choice.Target);
            } else if (nextLocation.Type === "Ending") {
                this.engine.gotoScene(EndingScene, choice.Target);
            } else if (nextLocation.Type === "Final") {
                this.engine.gotoScene(FinalScene, choice.Target);
            } else {
                this.engine.gotoScene(Location, choice.Target);
            }
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class MemoryLocation extends Scene {
    create(key) {
        this.key = key;
        this.locationData = this.engine.storyData.Locations[key];

        this.engine.show(this.locationData.Body);
        this.engine.addChoice("✨ Something feels familiar... (trigger memory)", { action: "memory" });

        for (let choice of this.locationData.Choices) {
            this.engine.addChoice(choice.Text, choice);
        }
    }

    handleChoice(choice) {
        if (choice.action === "memory") {
            this.engine.show("<em>Memory: " + this.locationData.MemoryText + "</em>");

            for (let choice of this.locationData.Choices) {
                this.engine.addChoice(choice.Text, choice);
            }
        } else {
            this.engine.show("> " + choice.Text);
            let nextLocation = this.engine.storyData.Locations[choice.Target];

            if (nextLocation.Type === "Memory") {
                this.engine.gotoScene(MemoryLocation, choice.Target);
            } else {
                this.engine.gotoScene(Location, choice.Target);
            }
        }
    }
}

class RoommateEncounter extends Scene {
    create(key) {
        this.locationData = this.engine.storyData.Locations[key];
        this.engine.show(this.locationData.Body);

        for (let choice of this.locationData.Choices) {
            this.engine.addChoice(choice.Text, choice);
        }
    }

    handleChoice(choice) {
        this.engine.show("> " + choice.Text);
        // Pass the ConvinceStyle along to the next scene
        this.engine.gotoScene(RoommateConvince, { 
            key: choice.Target, 
            convinceStyle: choice.ConvinceStyle 
        });
    }
}

class RoommateConvince extends Scene {
    create(data) {
        let locationData = this.engine.storyData.Locations[data.key];
        this.locationData = locationData;

        // Show different text depending on how the player approached it
        if (data.convinceStyle === "desperate") {
            this.engine.show("You tell the whole story. Your roommate blinks. '...okay yeah, let's go.'");
        } else {
            this.engine.show("You explain calmly. Your roommate nods. 'Sure, I was heading back anyway.'");
        }

        for (let choice of locationData.Choices) {
            this.engine.addChoice(choice.Text, choice);
        }
    }

    handleChoice(choice) {
        this.engine.show("> " + choice.Text);

        // This is where the key gets granted
        if (choice.GrantsKey) {
            this.engine.flags[choice.GrantsKey] = true;
        }

        this.engine.gotoScene(Location, choice.Target);
    }
}

class EndingScene extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);

        for (let choice of locationData.Choices) {
            this.engine.addChoice(choice.Text, choice);
        }
    }

    handleChoice(choice) {
        this.engine.show("> " + choice.Text);
        this.engine.gotoScene(FinalScene, choice.Target);
    }
}

class FinalScene extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');