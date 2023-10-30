import db  from "lib/db";
import type {NextApiRequest, NextApiResponse} from "next";

const transferHistory = db.collection('transfer_history');

const transferHistoryHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { page = 1, limit = 20 } = req.query;
  const cursor = await transferHistory.aggregate( [
    {
      $sort: {
        'time' : -1
      }
    },
    {
      $skip: (+page - 1) * +limit
    },
    {
      $limit: +limit
    }
  ]);
  const history = await cursor.toArray() || [];

  res.status(200).json(history);
}

export default transferHistoryHandler;