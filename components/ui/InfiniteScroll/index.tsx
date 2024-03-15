import InfiniteScroll from 'react-infinite-scroll-component'

export default function InfiniteScrollComponent({ component, total, fetchData, currentNumber }: any) {
  return (
    <InfiniteScroll
      dataLength={total} //This is important field to render the next data
      next={fetchData}
      hasMore={currentNumber < total}
      loader={null}
      endMessage={
        <p className="py-5 font-medium dark:text-black" style={{ textAlign: 'center' }}>
          You have seen it all
        </p>
      }
    >
      {component}
    </InfiniteScroll>
  )
}
