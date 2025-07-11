// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
// import { useDelayRelay } from "@/hooks/useDelayRelay";
// import { useUser } from "@/context/UserContext";
// import { formatDistanceToNow } from "date-fns";
// import type { DelayTransaction } from "@/client";

// const getStatusIcon = (status: DelayTransaction["status"]) => {
//   switch (status) {
//     case "EXECUTED":
//       return <CheckCircle className="h-4 w-4 text-green-500" />;
//     case "FAILED":
//       return <XCircle className="h-4 w-4 text-red-500" />;
//     case "EXECUTING":
//       return <AlertCircle className="h-4 w-4 text-blue-500" />;
//     default:
//       return <Clock className="h-4 w-4 text-yellow-500" />;
//   }
// };

// const getStatusText = (status: DelayTransaction["status"]) => {
//   switch (status) {
//     case "QUEUING":
//       return "Queuing";
//     case "WAITING":
//       return "Waiting";
//     case "EXECUTING":
//       return "Executing";
//     case "EXECUTED":
//       return "Executed";
//     case "FAILED":
//       return "Failed";
//     default:
//       return "Unknown";
//   }
// };

// export const DelayQueue = () => {
//   const { safeConfig } = useUser();
//   const { queue, isLoading } = useDelayRelay(safeConfig?.address || "");

//   if (!safeConfig?.address) {
//     return null;
//   }

//   if (isLoading) {
//     return (
//       <div className="bg-card p-4 rounded-xl">
//         <h3 className="font-semibold text-lg mb-2">Delay Queue</h3>
//         <p className="text-muted-foreground">Loading pending transactions...</p>
//       </div>
//     );
//   }

//   if (queue.length === 0) {
//     return (
//       <div className="bg-card p-4 rounded-xl">
//         <h3 className="font-semibold text-lg mb-2">Delay Queue</h3>
//         <p className="text-muted-foreground">No pending transactions</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-card p-4 rounded-xl">
//       <h3 className="font-semibold text-lg mb-2">Delay Queue</h3>
//       <p className="text-muted-foreground mb-4">Transactions are processed after a security delay period</p>
//       <div className="space-y-4">
//         {queue.map((transaction) => (
//           <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
//             <div className="flex items-center space-x-3">
//               {getStatusIcon(transaction.status)}
//               <div>
//                 <div className="font-medium">{getStatusText(transaction.status)}</div>
//                 <div className="text-sm text-muted-foreground">
//                   {transaction.createdAt && <>Created {formatDistanceToNow(new Date(transaction.createdAt))} ago</>}
//                 </div>
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-sm font-medium">
//                 {transaction.readyAt && new Date(transaction.readyAt) > new Date() && (
//                   <>Ready {formatDistanceToNow(new Date(transaction.readyAt))} from now</>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}

//         {queue.some((tx) => tx.status === "WAITING" || tx.status === "QUEUING") && (
//           <Alert>
//             <Clock className="h-4 w-4" />
//             <AlertDescription>
//               As a security measure, transactions are processed after a delay period. Your card will be temporarily
//               frozen during this time.
//             </AlertDescription>
//           </Alert>
//         )}
//       </div>
//     </div>
//   );
// };
