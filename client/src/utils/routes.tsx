import { HOME_PAGE, SECOND_PAGE } from "./paths";
import {Home, Second} from "./lazyRoutes"

export const publicRoutes = [
    {path: HOME_PAGE, element: <Home/>},
    {path: SECOND_PAGE, element: <Second/>},
]
