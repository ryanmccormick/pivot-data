interface SampleData {
  schoolName: string;
  class: number;
  category: string;
  count: number;
}

const sampleData: Array<SampleData> = [
  { schoolName: 'abc', class: 8, category: 'Male', count: 50 },
  { schoolName: 'abc', class: 8, category: 'Female', count: 43 },
  { schoolName: 'abc', class: 9, category: 'Male', count: 38 },
  { schoolName: 'abc', class: 9, category: 'Female', count: 36 },
  { schoolName: 'abc', class: 10, category: 'Male', count: 56 },
  { schoolName: 'abc', class: 10, category: 'Female', count: 48 },
  { schoolName: 'def', class: 8, category: 'Male', count: 50 },
  { schoolName: 'def', class: 8, category: 'Female', count: 43 },
  { schoolName: 'def', class: 9, category: 'Male', count: 38 },
  { schoolName: 'def', class: 9, category: 'Female', count: 36 },
  { schoolName: 'def', class: 10, category: 'Male', count: 56 },
  { schoolName: 'def', class: 10, category: 'Female', count: 48 },
];

class TreeNode {
  key: string;
  parent: string | null;
  children: Array<TreeNode>;
}

class TreeSearch {
  private parsedData: any;

  constructor(public readonly data: any) {}

  *getKeys(data: any = this.data, parentKey = ''): any {
    if (Object.keys(data).length) {
      for (let [k, v] of Object.entries(data)) {
        const key = parentKey ? `${parentKey}:${k}` : k;

        if (Array.isArray(v)) {
          yield key;
        } else {
          yield* this.getKeys(v, key);
        }
      }
    }

    // Object.entries(data).forEach(([k, v]) => {
    //   if(Array.isArray(v)) {
    //      yield parentKey;
    //
    //   }
    // })
  }
}

// function *searchObject(groupedData = {}, parent: string | null = null) {
//   Object.entries(groupedData).forEach(([k, v]) => {
//     if(!Array.isArray(v)) {
//       yield* ``
//     }
//   })
//
// }

function groupBy(items: Array<any>, key: string) {
  if (Array.isArray(items)) {
    return items.reduce((acc, curr) => {
      // get value from object as key
      const groupKey = curr[key];
      if (acc[groupKey]) {
        acc[groupKey].push(curr);
      } else {
        acc[groupKey] = [curr];
      }

      return acc;
    }, {});
  } else {
    return Object.entries(items).reduce((acc: any, [k, v]) => {
      // @ts-ignore
      acc[k] = groupBy(v, key);
      return acc;
    }, {});
  }
}

function autoGroupBy(value: Array<any>, groupDef: Array<string> = []) {
  let output = value;
  groupDef.forEach((group) => {
    output = groupBy(output, group);
  });

  return output;
}

// const columnDef = ['schoolName', 'class'];
// const rowDef = ['category'];

// const columnGroups = autoGroupBy(sampleData, ['schoolName', 'class']);
// const rowGroups = autoGroupBy(sampleData, ['category']);
//
// const columnKeys = Array.from(new TreeSearch(columnGroups).getKeys());
// const rowKeys = Array.from(new TreeSearch(rowGroups).getKeys());

function getRowRef(
  data: any,
  columnDef: Array<string> = [],
  rowDef: Array<string> = []
): Array<Array<string>> {
  const columnGroups = autoGroupBy(data, columnDef);
  const rowGroups = autoGroupBy(data, rowDef);
  const columnKeys = Array.from(new TreeSearch(columnGroups).getKeys());
  const rowKeys = Array.from(new TreeSearch(rowGroups).getKeys());

  return rowKeys.reduce((acc: Array<any>, curr: any) => {
    const row = columnKeys.map((key) => {
      return `${key}::::${curr}`;
    });

    acc.push(row);
    return acc;
  }, []);
}

function filterFactory(
  key: string,
  columnDef: Array<string>,
  rowDef: Array<string>
) {
  const [columns, rows] = key.split('::::');

  const rowFilters = rows.split(':').map((item, index) => {
    const key = rowDef[index];
    // return { [key]: item };
    return { key, value: item };
  });

  const columnFilters = columns.split(':').map((item, index) => {
    const key = columnDef[index];
    return { key, value: item };
  });

  return [...rowFilters, ...columnFilters];
}

function resultFromData(
  data: any,
  rowRef: string,
  columnDef: Array<string> = [],
  rowDef: Array<string> = []
): Array<any> {
  const filter: Array<any> = filterFactory(rowRef, columnDef, rowDef);
  return filter.reduce((acc, curr) => {
    const { key, value } = curr;
    acc = acc.filter((result: any) => {
      return String(result[key]) === String(value);
    });

    return acc;
  }, structuredClone(data))[0];
}

function getRowDataFilter(
  data: any,
  columnDef: Array<string> = [],
  rowDef: Array<string> = []
): Array<any> {
  const rowRef = getRowRef(data, columnDef, rowDef);

  return rowRef.map((curr: Array<string>) => {
    return curr.map((col) => {
      return resultFromData(data, col, columnDef, rowDef);
    });
  });
}

// const rowData = getRowRef(sampleData, ['schoolName', 'class'], ['category']);
// const rowData = getRowDataFilter(
//   sampleData,
//   ['schoolName', 'class'],
//   ['category']
// );

const rowData = getRowDataFilter(
  sampleData,
  ['category'],
  ['schoolName', 'class']
);

const groupedData = autoGroupBy(sampleData, ['schoolName', 'class']);

// row gen idea from columns
// {filters: [{key: 'schoolName', value: 'abc'}, {key: 'class', value: '8'}]}

// columns = [schoolName, class]
// rows = [category]
// data = count

export function App() {
  function formatToJson(data: any) {
    return JSON.stringify(data, null, 2);
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-4">
          <h2>All</h2>
          <pre>{formatToJson(sampleData)}</pre>
        </div>
        <div className="col-4">
          <h2>Column Group</h2>
          <pre>{formatToJson(groupedData)}</pre>
        </div>
        <div className="col-4">
          <h2>Row Group</h2>
          <pre>{formatToJson(rowData)}</pre>
        </div>
      </div>
    </div>
  );
}
