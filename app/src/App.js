import { useState, useRef, lazy, Suspense } from "react";
import clsx from "clsx";
import {
  ChakraBaseProvider,
  Container,
  InputGroup,
  Input,
  InputRightElement,
  Spinner,
  Grid,
  Center,
  Text,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import useLazyLoad from "./useLazyLoad";
import theme from "./lib/theme";
const Card = lazy(() => import("./CardContainer")); // lazy loading card component
const PAGE_LENGTH = 7; // max request
function App() {
  const [imgFilterData, setImgFilterData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [search, setSearch] = useState("");
  const triggerRef = useRef(null); // div that gets trigger when user navigates to bottom
  const onGrabData = (currentPage) => {
    if (currentPage < PAGE_LENGTH) {
      // condition to check if user has reached its max request
      return new Promise((resolve) => {
        fetch(`http://localhost:3000/content?_page=${currentPage}&_limit=10 
`) // fetching data from server
          .then((res) => res.json())
          .then((data) => {
            resolve(data); // ading data
          });
      });
    } else {
      return new Promise((resolve, reject) => {
        setLoader(false); // after reaching max request do not show loader
        reject();
      });
    }
  };
  const { data, loading } = useLazyLoad({ triggerRef, onGrabData }); // custom hook that takes triggering div and fetching data function

  const filterImgData = (value) => {
    // filter data from requested data
    setSearch(value);
    const newData = data.filter(({ name }) =>
      name.toUpperCase().includes(value.toUpperCase())
    );
    setImgFilterData(newData);
  };
  return (
    <>
      <ChakraBaseProvider theme={theme}>
        <Container mt={10}>
          <InputGroup mb={8} maxW="90vw">
            <Input
              variant="outline"
              w="90vw"
              placeholder="Search..."
              onChange={(e) => filterImgData(e.target.value)}
            />
            <InputRightElement children={<Search2Icon />}></InputRightElement>
          </InputGroup>
          {!search ? (
            <>
              <Grid templateColumns="repeat(3,1fr)" gap={6}>
                {data.map(({ name, poster_image, index }) => {
                  return (
                    <Suspense
                      fallback={
                        <Center mt={10}>
                          <Spinner
                            thickness="4px"
                            speed="0.65s"
                            emptyColor="gray.200"
                            color="blue.500"
                            size="xl"
                          />
                        </Center>
                      }
                    >
                      <Card
                        name={name}
                        poster_image={poster_image}
                        index={index}
                      />
                    </Suspense>
                  );
                })}
              </Grid>
              <div
                ref={triggerRef}
                className={clsx("trigger", { visible: loading })}
              >
                {loader && (
                  <Center mt={10}>
                    <Spinner
                      thickness="4px"
                      speed="0.65s"
                      emptyColor="gray.200"
                      color="blue.500"
                      size="xl"
                    />
                  </Center>
                )}
              </div>
            </>
          ) : (
            <Grid templateColumns="repeat(3,1fr)" gap={6}>
              {!imgFilterData.length ? (
                <Center>
                  <Text>No Search Found</Text>
                </Center>
              ) : (
                imgFilterData.map(({ name, poster_image, index }) => {
                  return (
                    <Suspense
                      fallback={
                        <Center mt={10}>
                          <Spinner
                            thickness="4px"
                            speed="0.65s"
                            emptyColor="gray.200"
                            color="blue.500"
                            size="xl"
                          />
                        </Center>
                      }
                    >
                      <Card
                        name={name}
                        poster_image={poster_image}
                        index={index}
                      />
                    </Suspense>
                  );
                })
              )}
            </Grid>
          )}
        </Container>
      </ChakraBaseProvider>
    </>
  );
}

export default App;
