// import { Input } from "@/components";
// import useDebounce from "@/hooks/useDebounce";

// import { RequestParametersInterface } from "@/types/RequestParameters";
// import { useCallback, useState } from "react";
// import { FaSearch } from "react-icons/fa";

// interface FilterProps {
//   updateParams: (params: Partial<RequestParametersInterface>) => void;
// }

// export function Filter({ updateParams }: FilterProps) {
//   const [searchTerm, setSearchTerm] = useState("");

//   const search = useCallback(() => {
//     updateParams({ searchTerm, pageNumber: 1 });
//   }, [searchTerm, updateParams]);

//   useDebounce({
//     callback: search,
//     delay: 1000,
//     dependencies: [searchTerm],
//   });

//   return (
//     <div className="w-full">
//       <Input.Base
//         id="search"
//         placeholder={"Pesquisar nome"}
//         onChange={(e) => {
//           const value = e.target.value;
//           setSearchTerm(value);
//         }}
//         rightElement={<FaSearch />}
//       />
//     </div>
//   );
// }
