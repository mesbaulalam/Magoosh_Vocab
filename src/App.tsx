import React, { useEffect, useState } from "react";
import ReactHtmlParser from "react-html-parser";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { ButtonGroupProps } from "react-multi-carousel/lib/types";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 1,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};
const json = require("./assets/magooshJSON.json");

interface CardContent {
  id: number;
  meaning: string;
  sentence: string;
  word: string;
}

//Shuffle the vocabularies around
const shuffle = (array: CardContent[]) => {
  var currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

const App: React.FC = () => {
  const [data, setData] = useState<CardContent[]>([]);
  const [mistakes, setMistakes] = useState<CardContent[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [type, setType] = useState<"revision" | "mistakes">("revision");

  useEffect(() => {
    setCurrentIndex(0);
    let store: CardContent[] = [];
    if (type === "revision") {
      const slicedArray = json.slice(0, 13);
      slicedArray.forEach((data: { cards: any[] }) => {
        data.cards.forEach((words) => {
          store.push({
            id: words.id,
            word: words.back[0].content,
            meaning: words.back[1].content,
            sentence: words.back[2].content,
          });
        });
      });
    } else {
      store = mistakes;
    }
    store = shuffle(store);
    setData(store);
  }, [type]);

  const ButtonGroup = ({
    next,
    previous,
    goToSlide,
    ...rest
  }: ButtonGroupProps) => {
    return (
      <div className="carousel-button-group absolute left-1/2 bottom-0 -ml-56">
        <button
          className="bg-green-400 px-5 py-3 text-sm shadow-sm font-medium tracking-wider border text-green-100 rounded-full hover:shadow-lg hover:bg-green-500 mr-4"
          onClick={() => {
            const filteredMistakes = mistakes.filter(
              (words) => words.id !== data[currentIndex].id
            );
            setMistakes(filteredMistakes);
            if (type === "mistakes") {
              let filteredData = data.filter(
                (words) => words.id !== data[currentIndex].id
              );
              setData(filteredData);
            } else {
              setCurrentIndex(currentIndex + 1);
            }
            next !== undefined && next();
          }}
        >
          I know this meaning!
        </button>
        <button
          className="bg-red-400 px-5 py-3 text-sm shadow-sm font-medium tracking-wider border text-red-100 rounded-full hover:shadow-lg hover:bg-red-500"
          onClick={() => {
            let check = mistakes.some(
              (words) => words.id === data[currentIndex].id
            );
            check === false && setMistakes([...mistakes, data[currentIndex]]);
            setCurrentIndex(currentIndex + 1);
            next !== undefined && next();
          }}
        >
          I don't know this meaning!
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-around items-center h-full bg-gray-50">
      <div className="text-5xl">Magoosh Vocab Practice!</div>
      <div className="text-4xl">
        Vocabs Missed: <span className="text-red-500">{mistakes.length}</span>
      </div>
      <div className="flex">
        <button
          className="border-2 border-blue-600 rounded-lg px-3 py-2 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-blue-200 mr-5"
          disabled={type === "revision"}
          onClick={() => setType("revision")}
        >
          Revise Randomly
        </button>
        <button
          className="border-2 border-red-600 rounded-lg px-3 py-2 text-red-400 cursor-pointer hover:bg-red-600 hover:text-red-200"
          disabled={type === "mistakes" || mistakes.length === 0}
          onClick={() => setType("mistakes")}
        >
          Revise Mistakes
        </button>
      </div>
      {data.length === 0 && type === "mistakes" ? (
        <div className="text-4xl text-center text-green-400">
          You have successfully revised all mistakes! Click on random revision
          to revise words randomly
        </div>
      ) : (
        <div className="w-full">
          <Carousel
            responsive={responsive}
            infinite={true}
            draggable={false}
            arrows={false}
            customButtonGroup={<ButtonGroup />}
            beforeChange={() => {
              setShow(false);
            }}
          >
            {data.map((words) => {
              return (
                <div key={words.id} className="flex justify-center">
                  <div className="max-w-md py-4 px-8 bg-white shadow-lg rounded-lg my-20">
                    <div className="flex items-center justify-between">
                      <div className="text-gray-800 text-3xl font-semibold">
                        {words.word}
                      </div>
                      <button
                        className="bg-red-500 px-5 py-3 text-sm shadow-sm font-medium tracking-wider border text-red-100 rounded-full hover:shadow-lg hover:bg-red-600"
                        onClick={() => setShow(true)}
                      >
                        Show Meaning
                      </button>
                    </div>
                    <p
                      className={`mt-2 text-gray-600 + ${
                        show === false ? " invisible" : ""
                      }`}
                    >
                      {ReactHtmlParser(words.meaning)}
                    </p>
                    <div className="flex justify-end mt-4">
                      <div
                        className={`text-xl font-medium text-indigo-500 cursor-pointer+ ${
                          show === false ? " invisible" : ""
                        }`}
                      >
                        {ReactHtmlParser(words.sentence)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default App;
