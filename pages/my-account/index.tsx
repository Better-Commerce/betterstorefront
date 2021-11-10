import { useState, useEffect } from 'react'
import { Layout } from '@components/common'
import withDataLayer, { PAGE_TYPES } from '@components/withDataLayer'
import { Tab } from '@headlessui/react'
import { config } from '@components/utils/myAccount'
import COMPONENTS_MAP from '@components/account'
import withAuth from '@components/utils/withAuth'
import { useRouter } from 'next/router'
function MyAccount({ defaultView }: any) {
  const [view, setView] = useState(defaultView)
  const router = useRouter()

  const handleTabChange = (index: number) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, view: config[index].props },
      },
      undefined,
      { shallow: true }
    )
  }
  useEffect(() => {
    if (router.query.view && view !== router.query.view) {
      setView(router.query.view)
    }
  }, [router.asPath])

  return (
    <section className="text-gray-900 relative py-10">
      <div className="w-full">
        <div className="justify-between px-10 flex flex-col md:flex-row">
          <Tab.Group
            onChange={handleTabChange}
            vertical
            defaultIndex={defaultView}
          >
            <Tab.List className="sticky top-0 flex flex-col w-full md:w-1/4 bg-gray-200 h-full rounded-lg">
              {config.map((item: any, idx: number) => {
                return (
                  <Tab
                    key={`my-acc-${idx}`}
                    className={({ selected }: any) => {
                      return `${
                        selected
                          ? 'bg-white text-indigo-600 border border-indigo-600'
                          : ''
                      } w-full px-5 py-5 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-indigo-600 text-lg leading-5 font-medium text-gray-700 font-bold rounded-lg focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60`
                    }}
                  >
                    {item.text}
                  </Tab>
                )
              })}
            </Tab.List>
            <Tab.Panels className="w-3/4">
              {config.map((item: any, idx: any) => {
                let Component = COMPONENTS_MAP[item.props] || null
                return (
                  <Tab.Panel
                    className={item.props + ' ' + 'text-gray-900'}
                    key={idx}
                  >
                    <Component />
                  </Tab.Panel>
                )
              })}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </section>
  )
}

MyAccount.Layout = Layout

const PAGE_TYPE = PAGE_TYPES.Page

export async function getServerSideProps(context: any) {
  const defaultIndex =
    config.findIndex((element: any) => element.props === context.query.view) ||
    0
  return {
    props: { defaultView: defaultIndex }, // will be passed to the page component as props
  }
}

export default withDataLayer(withAuth(MyAccount), PAGE_TYPE)
