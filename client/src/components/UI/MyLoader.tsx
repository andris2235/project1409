import {ScaleLoader} from "react-spinners";

const MyLoader = () => {

  return (
    <div
      style={{
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        display: "flex"
      }}
    >
      <ScaleLoader color={'rgba(0, 0, 0, 1)'} />
    </div>
  );
};

export default MyLoader;