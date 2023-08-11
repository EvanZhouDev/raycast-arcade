import { List, ActionPanel, Action, launchCommand, LaunchType, Icon } from "@raycast/api"
export default function SearchGames() {
    return (
        <List
            isShowingDetail={true}
            searchBarPlaceholder="Search for your favorite game..."
        >
            <List.Item
                title={"Tetris"}
                detail={<List.Item.Detail
                    markdown={`
# Tetris

The classic block-stacking game, remade in Raycast!

Control the falling block with WASD, and clear as many lines as you can.

As the blocks fall faster and faster, the game becomes more intense.
                    `}
                />}
                actions={
                    <ActionPanel>
                        <Action title="Play Tetris" onAction={async () => await launchCommand({ name: "tetris", type: LaunchType.UserInitiated })} />
                    </ActionPanel>
                }
            />
            <List.Item
                title={"Wordle"}
                detail={<List.Item.Detail
                    markdown={`
# Wordle

The classic word guessing game, replicated beautifully in Raycast.

You have 6 guesses to figure out a 5 letter word, with clues that reveal themselves along the way.

With 2 modes to choose from, the fun is (literally) Unlimited!

1. *Daily Wordle*: Play the daily puzzle from New York Times. Get a new puzzle each day!
2. *Wordle Unlimited*: Finished the daily puzzle? Keep on playing! From the official list of possible words, Wordle Unlimited is an amazing experience.
                    `}
                />}
                actions={
                    <ActionPanel>
                        <Action title="Play Wordle" onAction={async () => await launchCommand({ name: "wordle", type: LaunchType.UserInitiated })} />
                    </ActionPanel>
                }
            />
            <List.Item
                title={"Chrome Dino"}
                detail={<List.Item.Detail
                    markdown={`
# Chrome Dinosaur Game

The classic endless runner game!

Jump over cacti with enter, and try to survive as long as you can, while you move faster and faster.

How many points can you get?
                    `}
                />}
                actions={
                    <ActionPanel>
                        <Action title="Play Chrome Dino" onAction={async () => await launchCommand({ name: "dino", type: LaunchType.UserInitiated })} />
                    </ActionPanel>
                }
            />
        </List>
    )
}