import React, { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { publicRoutes } from "./utils/routes";
import { HOME_PAGE } from "./utils/paths";
import MyLoader from "./components/UI/MyLoader";

const MainRouter: React.FC = () => {

    return (
        <BrowserRouter>

            <Suspense fallback={<MyLoader />}>
                <Routes>
                    
                    {publicRoutes.map(item => {
                        return <Route element={item.element} path={item.path} key={item.path} />
                    })}
                    <Route path="*" element={<Navigate to={HOME_PAGE} />} />
                </Routes>
            </Suspense>
    
        </BrowserRouter>
    )
}

export default MainRouter;