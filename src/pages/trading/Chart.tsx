// css
import "./Chart.css"
// js
import { ADX, SMA } from "@debut/indicators"
import { iconBookmark } from "@gazatu/solid-spectre/icons/iconBookmark"
import { iconSearch } from "@gazatu/solid-spectre/icons/iconSearch"
import { A } from "@gazatu/solid-spectre/ui/A"
import { Button } from "@gazatu/solid-spectre/ui/Button"
import { Column } from "@gazatu/solid-spectre/ui/Column"
import { Icon } from "@gazatu/solid-spectre/ui/Icon"
import { Label } from "@gazatu/solid-spectre/ui/Label"
import { Modal } from "@gazatu/solid-spectre/ui/Modal"
import { ModalPortal } from "@gazatu/solid-spectre/ui/Modal.Portal"
import { Table } from "@gazatu/solid-spectre/ui/Table"
import { createTableState } from "@gazatu/solid-spectre/ui/Table.Helpers"
import { Tile } from "@gazatu/solid-spectre/ui/Tile"
import { Toaster } from "@gazatu/solid-spectre/ui/Toaster"
import { centerChildren } from "@gazatu/solid-spectre/util/position"
import { createAsyncMemo } from "@solid-primitives/memo"
import { createStorageSignal } from "@solid-primitives/storage"
import { useNavigate, useSearchParams } from "@solidjs/router"
import type { BarData, IChartApi, IPriceLine } from "lightweight-charts"
import { Component, ComponentProps, For, createEffect, createMemo, createRenderEffect, createSignal, onCleanup } from "solid-js"
import { Subscription, TraderepublicAggregateHistoryLightSub, TraderepublicDerivativesSub, TraderepublicHomeInstrumentExchangeData, TraderepublicInstrumentData, TraderepublicStockDetailsData, TraderepublicWebsocket } from "../../lib/traderepublic"
import SymbolInfo from "./SymbolInfo"
import SymbolSearch from "./SymbolSearch"
import WatchList from "./WatchList"

const dateFormat = new Intl.DateTimeFormat("en", {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
})

const currencyFormat = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "EUR",
})

const numberCompactFormat = new Intl.NumberFormat("en", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
  notation: "compact",
})

type SymbolSearchModalProps = {
  socket: TraderepublicWebsocket
  initialSearch?: string
  initialFilter?: "stock" | "fund" | "derivative" | "crypto" | "bond"
  resolve: (isin: string) => void
  reject: () => void
}

const SymbolSearchModal: Component<SymbolSearchModalProps> = props => {
  const [search, setSearch] = createSignal(props.initialSearch ?? "")
  const [filter, setFilter] = createSignal(props.initialFilter ?? "stock")

  const [loading, setLoading] = createSignal(false)
  const [symbols, setSymbols] = createSignal<ComponentProps<typeof SymbolSearch>["symbols"]>()

  createEffect((cleanupPreviousEffect?: () => void) => {
    cleanupPreviousEffect?.()
    const effect = {
      cancelled: false,
    }

    setLoading(true)

    void (async () => {
      const results = await props.socket.search(search(), filter(), 10)
      const symbols = await Promise.all(
        results.map(async ({ isin }) => {
          const instrument = await props.socket.instrument(isin).toPromise()
          // const exchange = await socket.exchange(instrument).toPromise()
          const details = await props.socket.details(instrument)

          return {
            isin,
            symbol: instrument?.intlSymbol || instrument?.homeSymbol,
            name: details?.company.name ?? instrument?.shortName,
            logo: instrument.imageId ? `https://assets.traderepublic.com/img/${instrument.imageId}/dark.min.svg` : undefined,
          }
        })
      )

      if (effect.cancelled) {
        return
      }

      setSymbols(symbols)
      setLoading(false)
    })()

    return () => {
      effect.cancelled = true

      setSymbols([])
      setLoading(false)
    }
  })

  return (
    <Modal onclose={props.reject} active style={{ padding: 0, "min-height": "50vh" }}>
      <Modal.Body>
        <SymbolSearch
          search={search()}
          onSearchChange={setSearch}
          filters={[
            {
              id: "stock",
              name: "Stocks",
              active: filter() === "stock",
            },
            {
              id: "fund",
              name: "Funds",
              active: filter() === "fund",
            },
            {
              id: "derivative",
              name: "Derivatives",
              active: filter() === "derivative",
            },
            {
              id: "crypto",
              name: "Crypto",
              active: filter() === "crypto",
            },
            {
              id: "bond",
              name: "Bonds",
              active: filter() === "bond",
            },
          ]}
          onFilterChange={filter => setFilter(filter.id as any)}
          symbols={symbols() ?? []}
          onSymbolClick={symbol => props.resolve(symbol.isin!)}
          loading={loading()}
        />
      </Modal.Body>
    </Modal>
  )
}

const ChartView: Component = props => {
  const [search, setSearch] = useSearchParams()

  const navigate = useNavigate()

  const [timeRange, setTimeRange] = createStorageSignal<"5min" | TraderepublicAggregateHistoryLightSub["range"]>("CHART_TIME_RANGE2", "1d", {
    serializer: (v: any) => JSON.stringify(v),
    deserializer: s => JSON.parse(s),
  })

  const [instrument, setInstrument] = createSignal<TraderepublicInstrumentData>()
  const [exchange, setExchange] = createSignal<TraderepublicHomeInstrumentExchangeData>()
  const [details, setDetails] = createSignal<TraderepublicStockDetailsData>()
  const [value, setValue] = createSignal({
    current: 0,
    previous: 0,
  })
  const [, setPrice] = createSignal(0)

  const socket = new TraderepublicWebsocket("DE")
  Toaster.try(async () => {
    await socket.connect()
  })
  onCleanup(() => {
    socket.close()
  })

  type WatchListEntry = {
    isin: string
    buyIn?: number
    shares?: number
  }

  const [watchList, setWatchList] = createStorageSignal("CHART_WATCH_LIST3", [] as WatchListEntry[], {
    serializer: (v: WatchListEntry[]) => JSON.stringify(v),
    deserializer: s => JSON.parse(s),
  })

  type WatchedInstrument = WatchListEntry & {
    data: ReturnType<typeof instrument>
    exchange: ReturnType<typeof exchange>
    details: ReturnType<typeof details>
    value: ReturnType<typeof value>
  }

  const [watchedInstruments, setWatchedInstruments] = createSignal([] as WatchedInstrument[])
  createRenderEffect(() => {
    const effect = {
      cancelled: false,
      subscriptions: [] as Subscription[],
    }

    void (async () => {
      setWatchedInstruments(r => {
        return watchList()
          ?.map(watched => {
            const current = r.find(i => i.isin === watched.isin)

            return {
              ...watched,
              data: undefined,
              exchange: undefined,
              details: undefined,
              value: {
                current: 0,
                previous: 0,
              },
              history: [],
              ...current,
            }
          }) ?? []
      })

      for (const { isin } of watchList() ?? []) {
        const instrument = await socket.instrument(isin).toPromise()
        const exchange = await socket.exchange(instrument).toPromise()
        const details = await socket.details(instrument)

        if (effect.cancelled) {
          return
        }

        setWatchedInstruments(r => r.map(i => {
          if (i.isin !== isin) {
            return i
          }

          return {
            ...i,
            data: instrument,
            exchange,
            details,
          }
        }))

        effect.subscriptions.push(
          socket.ticker(instrument).subscribe(data => {
            if (effect.cancelled) {
              return
            }

            setWatchedInstruments(r => r.map(i => {
              if (i.isin !== isin) {
                return i
              }

              return {
                ...i,
                value: {
                  current: Number(data.bid.price),
                  previous: Number(data.pre.price),
                },
              }
            }))
          })
        )
      }
    })()

    return () => {
      effect.cancelled = true
      effect.subscriptions.forEach(s => s.unsubscribe())
    }
  }, [socket, watchList, timeRange])

  // const portfolio = createMemo(() => {
  //   return watchedInstruments()
  //     .map(instrument => {
  //       const { buyIn, shares } = watchList()!.find(({ isin }) => instrument.isin)!

  //       return {
  //         ...instrument,
  //         owned: {
  //           buyIn: buyIn ?? 0,
  //           shares: shares ?? 0,
  //         },
  //       }
  //     })
  //     .filter(({ owned }) => owned.buyIn && owned.shares)
  // }, [watchedInstruments, watchList])

  // const portfolioValue = useMemo(() => {
  //   return portfolio
  //     .reduce((portfolioValue, { value, owned }) => portfolioValue + (value.current * owned.shares), 0)
  // }, [portfolio])

  const [chartContainer, setChartContainer] = createSignal<HTMLDivElement>()
  let chart = undefined as IChartApi | undefined

  createEffect(async (cleanupPreviousEffect?: Promise<() => void>) => {
    const isin = search.isin
    const range = timeRange()

    void (await cleanupPreviousEffect)?.()
    const effect = {
      cancelled: false,
      subscriptions: [] as Subscription[],
    }

    if (!chartContainer()) {
      return () => undefined as void
    }

    if (!chart) {
      const {
        createChart,
        ColorType,
      } = await import("lightweight-charts")

      chart = createChart(chartContainer()!, {
        layout: {
          background: {
            type: ColorType.Solid,
            color: "#1E222D",
          },
          textColor: "#D9D9D9",
          fontSize: 14,
        },
        crosshair: {
          horzLine: {
            color: "#758696",
          },
          vertLine: {
            color: "#758696",
          },
        },
        grid: {
          horzLines: {
            color: "#363C4E",
          },
          vertLines: {
            color: "#2B2B43",
          },
        },
        timeScale: {
          // borderVisible: false,
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          // borderVisible: false,
          // mode: PriceScaleMode.Percentage,
        },
        localization: {
          priceFormatter: (price: number) => currencyFormat.format(price),
          // timeFormatter: (time: number) => timeFormat.format(new Date(time * 1000)),
        },
      })
    }

    let movingAverageData = new SMA(0)
    const movingAverageSeries = chart.addLineSeries({
      baseLineVisible: false,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    let averageDirectionalIndexData = new ADX(0)
    const averageDirectionalIndexSeries = chart.addHistogramSeries({
      baseLineVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
      priceScaleId: "",
      priceFormat: {
        type: "volume",
      },
    })
    averageDirectionalIndexSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })

    const series = chart.addCandlestickSeries({
      // fdm
    })

    let currentBar = { time: 0 } as BarData
    let previousClose: IPriceLine | undefined

    void (async () => {
      if (isin?.length !== 12) {
        return
      }

      const instrument = await new Promise<TraderepublicInstrumentData>((resolve, reject) => (
        socket.instrument(isin).subscribe(instrument => {
          if (effect.cancelled) {
            reject()
            return
          }

          setInstrument(instrument)
          resolve(instrument)
        })
      ))
      if (!instrument) {
        return
      }

      socket.exchange(instrument).subscribe(exchange => {
        if (effect.cancelled) {
          return
        }

        setExchange(exchange)
      })

      socket.details(instrument).then(details => {
        if (effect.cancelled) {
          return
        }

        setDetails(details)
      })

      const timezoneOffset = (new Date().getTimezoneOffset() / 60) * -1
      const mapUnixToUTC = (time: number) =>
        Math.floor(time / 1000) + (60 * 60 * timezoneOffset) as any

      let barTimeToLive = 0
      let priceBeforeChart = 0

      const history = await socket.aggregateHistory(instrument, range === "5min" ? "1d" : range!)

      if (effect.cancelled) {
        return
      }

      priceBeforeChart = Number(history.aggregates[0]?.close ?? 0)
      barTimeToLive = history.resolution / 1000
      if (range === "5min") {
        barTimeToLive /= 2
      }

      for (const aggregate of history.aggregates) {
        const utcTimestamp = mapUnixToUTC(aggregate.time)

        currentBar = {
          time: utcTimestamp,
          open: Number(aggregate.open),
          close: Number(aggregate.close),
          low: Number(aggregate.low),
          high: Number(aggregate.high),
        }

        if (range === "5min") {
          series.update({
            time: (Number(currentBar.time) - barTimeToLive) as any,
            open: currentBar.open,
            high: currentBar.open,
            low: currentBar.open,
            close: currentBar.open,
          })
        }

        series.update(currentBar)
      }

      if (range === "5d" || range === "1m") {
        const begin = history.aggregates[0].time
        const end = history.lastAggregateEndTime
        const timePeriodInDays = Math.ceil((end - begin) / (24 * 60 * 60 * 1000))
        const timePeriod = Math.max(Math.min(timePeriodInDays, 14), 7)

        movingAverageData = new SMA(timePeriod)
        averageDirectionalIndexData = new ADX(timePeriod)

        for (const aggregate of history.aggregates) {
          const time = mapUnixToUTC(aggregate.time)

          const smaValue = movingAverageData.nextValue(Number(aggregate.close))
          movingAverageSeries.update({
            time,
            value: smaValue ?? undefined,
          })

          const adxValue = averageDirectionalIndexData.nextValue(Number(aggregate.high), Number(aggregate.low), Number(aggregate.close))
          averageDirectionalIndexSeries.update({
            time,
            value: adxValue?.adx ?? undefined,
            color: (() => {
              const adx = adxValue?.adx ?? 0

              if (adx < 5) {
                return "#ff000044" // red
              }
              if (adx < 15) {
                return "#ffa50044" // orange
              }
              if (adx < 25) {
                return "#ffff0044" // yellow
              }
              if (adx < 35) {
                return "#adff2f44" // yellowgreen
              }
              if (adx < 50) {
                return "#00800044" // green
              }
              return "#00ffff44" // cyan
            })(),
          })
        }
      }

      chart?.timeScale().fitContent()

      effect.subscriptions.push(
        socket.ticker(instrument).subscribe(data => {
          if (effect.cancelled) {
            return
          }

          const utcTimestamp = mapUnixToUTC(data.bid.time)

          if (!previousClose) {
            priceBeforeChart = priceBeforeChart || Number(data.pre.price)
            if (range === "1d") {
              priceBeforeChart = Number(data.pre.price)
            }

            previousClose = series.createPriceLine({
              price: priceBeforeChart,
              color: "gray",
              lineVisible: true,
              lineWidth: 1,
              lineStyle: 1, // LineStyle.Dotted,
              axisLabelVisible: false,
              title: "previous close",
            })

            setValue(v => ({
              ...v,
              previous: priceBeforeChart,
            }))
          }

          if ((utcTimestamp - (currentBar.time as any)) >= barTimeToLive) {
            currentBar = {
              ...currentBar,
              close: Number(data.last.price),
            }

            // TODO

            series.update({
              ...currentBar,
            })

            currentBar = {
              time: utcTimestamp,
              open: Number(data.bid.price),
              close: Number(data.bid.price),
              low: Number(data.bid.price),
              high: Number(data.bid.price),
            }
          } else {
            currentBar = {
              ...currentBar,
              close: Number(data.bid.price),
              low: Math.min(currentBar.low, Number(data.bid.price)),
              high: Math.max(currentBar.high, Number(data.bid.price)),
            }
          }

          setValue(v => ({
            ...v,
            current: currentBar.close,
          }))

          series.update({
            ...currentBar,
          })
        })
      )

      // effect.subscriptions.push(
      //   socket.priceForOrder(instrument).subscribe(({ price }) => {
      //     setPrice(price)
      //   })
      // )
    })()

    return () => {
      chart?.removeSeries(series)
      chart?.removeSeries(movingAverageSeries)
      chart?.removeSeries(averageDirectionalIndexSeries)

      setInstrument(undefined)
      setExchange(undefined)
      setDetails(undefined)
      setValue({
        current: 0,
        previous: 0,
      })
      setPrice(0)

      effect.cancelled = true
      effect.subscriptions.forEach(s => s.unsubscribe())
    }
  })

  const handleSearch = async () => {
    const isin = await ModalPortal.push<string>(modal => (
      <SymbolSearchModal socket={socket} resolve={isin => modal.resolve(isin)} reject={() => modal.resolve("")} />
    ))
    if (!isin) {
      return
    }

    setSearch({ isin })
  }

  // const handleShowNews = async () => {
  //   const timeFormatter = new Intl.RelativeTimeFormat()

  //   await ModalPortal.push(modal => {
  //     const news = createAsyncMemo(async () => {
  //       const news = await socket.news(instrument()!)
  //       news.sort((a, b) => b.createdAt - a.createdAt)
  //       return news
  //     })

  //     return (
  //       <Modal onclose={modal.reject} active style={{ padding: 0, "min-height": "50vh" }}>
  //         <Modal.Body>
  //           <For each={news()}>
  //             {news => (
  //               <A href={news.url}>
  //                 <Tile compact>
  //                   <Tile.Body>
  //                     <Tile.Title>{news.headline}</Tile.Title>
  //                     <Tile.Subtitle>{timeFormatter.format(Math.round((new Date(news.createdAt).getTime() - new Date().getTime()) / 1000 / 60 / 60), "hours")} {news.summary}</Tile.Subtitle>
  //                   </Tile.Body>
  //                 </Tile>
  //               </A>
  //             )}
  //           </For>
  //         </Modal.Body>
  //       </Modal>
  //     )
  //   })
  // }

  const toggleInstrumentInWatchList = () =>
    setWatchList(l => {
      if (!instrument()) {
        return l
      }

      if (l!.map(({ isin }) => isin).includes(instrument()!.isin)) {
        return l!.filter(({ isin }) => isin !== instrument()!.isin)
      } else {
        return [{ isin: instrument()!.isin }, ...(l ?? [])]
      }
    })

  // const manageInstrumentNotifications = useMemo(() => {
  //   return async () => {
  //     const permission = await Notification.requestPermission()
  //     if (permission !== 'granted') {
  //       return
  //     }
  //   }
  // }, [])

  const instrumentWatchListEntry = createMemo(() => {
    return watchList()
      ?.find(({ isin }) => isin === instrument()?.isin)
  })

  const instrumentBuyIn = createMemo(() => {
    return instrumentWatchListEntry()?.buyIn
  })
  // const setInstrumentBuyIn = (value: number | undefined) => {
  //   setWatchList(l => {
  //     return l!.map(entry => {
  //       if (entry.isin !== instrument()?.isin) {
  //         return entry
  //       }

  //       return {
  //         ...entry,
  //         buyIn: value,
  //       }
  //     })
  //   })
  // }

  const instrumentShares = createMemo(() => {
    return instrumentWatchListEntry()?.shares
  })
  // const setInstrumentShares = (value: number | undefined) => {
  //   setWatchList(l => {
  //     return l!.map(entry => {
  //       if (entry.isin !== instrument()?.isin) {
  //         return entry
  //       }

  //       return {
  //         ...entry,
  //         shares: value,
  //       }
  //     })
  //   })
  // }

  createEffect(() => {
    if (!search.warrants) {
      return
    }

    void (async () => {
      try {
        const derivative = await ModalPortal.push<string>(modal => {
          const [getOptions, setOptions] = createSignal<Partial<TraderepublicDerivativesSub>>({
            productCategory: "vanillaWarrant",
            optionType: "call",
            sortBy: "strike",
            sortDirection: "asc",
            strike: value().current * 0.80,
          })

          const derivatives = createAsyncMemo(async () => {
            const {
              productCategory,
              optionType,
              sortBy,
              sortDirection,
              strike,
            } = getOptions()

            try {
              const derivatives = await socket.derivatives(instrument()!, {
                productCategory,
                optionType,
                sortBy,
                sortDirection,
                strike,
              })

              const now = new Date()
              derivatives.results = derivatives.results.filter(d => {
                try {
                  return new Date(d.expiry).getFullYear() <= now.getFullYear()
                } catch {
                  return true
                }
              })

              return derivatives.results
            } catch (error) {
              Toaster.pushError(error)

              return []
            }
          })

          const [tableState] = createTableState({
            pagination: {
              pageIndex: 0,
              pageSize: 100,
            },
          })

          const dateFormatter = new Intl.DateTimeFormat("en", {
          })

          const dollarFormatter = new Intl.NumberFormat("en", {
            style: "currency",
            currency: "USD",
          })

          const table = Table.createContext({
            get data() {
              return derivatives() ?? []
            },
            columns: [
              {
                accessorKey: "__delta",
                header: "Delta",
                cell: (props) => (
                  <Tile compact>
                    <Tile.Body>
                      <Tile.Title>{props.row.original.delta.toFixed(2)}</Tile.Title>
                      <Tile.Subtitle>{dateFormatter.format(new Date(props.row.original.expiry ?? 0))} - {props.row.original.issuerDisplayName}</Tile.Subtitle>
                    </Tile.Body>
                  </Tile>
                ),
                enableSorting: false,
              },
              {
                accessorKey: "__strike",
                header: "Strike",
                cell: (props) => (
                  <span>{dollarFormatter.format(props.row.original.strike ?? 0)}</span>
                ),
                enableSorting: false,
              },
            ],
            state: tableState,
            // onGlobalFilterChange: tableOnGlobalFilterChange(setTableState),
            manualFiltering: true,
            manualSorting: true,
            onSortingChange: state => {
              // ignore
            },
          })

          return (
            <Modal size="md" onclose={modal.reject} active>
              <Modal.Body>
                <Table context={table} loadingSize="sm" striped hidePagination onclickRow={row => modal.resolve(row.original.isin)} toolbar={
                  <Column.Row class={`${centerChildren(true)}`} style={{ height: "100%" }} gaps="sm">
                    <For each={[{ id: "call", name: "Call" }, { id: "put", name: "Put" }]}>
                      {filter => (
                        <Column>
                          <A onclick={() => setOptions(o => ({ ...o, optionType: filter.id as any }))}>
                            <Label round color={getOptions().optionType === filter.id ? "primary" : undefined}>{filter.name}</Label>
                          </A>
                        </Column>
                      )}
                    </For>
                  </Column.Row>
                } />
              </Modal.Body>
            </Modal>
          )
        })

        navigate(`/trading/chart?isin=${derivative}`)
      } catch {
        navigate(`/trading/chart?isin=${instrument()?.isin}`)
      }
    })()
  })

  return (
    <div style={{ display: "flex", "flex-direction": "column", "flex-grow": 1, background: "#1e222d", "box-shadow": "-10px 0px 13px -7px #161616, 10px 0px 13px -7px #161616, 5px 5px 15px 5px rgb(0 0 0 / 0%)" }}>
      <Column.Row gaps="none" style={{ "flex-grow": 1 }}>
        <Column xxl={9} md={12} style={{ display: "flex", "flex-direction": "column", "flex-grow": 1, background: "#1e222d" }}>
          <div style={{ background: "#1e222d" }}>
            <Column.Row style={{ padding: "1rem 1rem 0.25rem 1rem" }}>
              <Column xxl={4} md={6} sm={12}>
                <Button onClick={handleSearch} round>
                  <Icon src={iconSearch} />
                  <span>Search Symbol...</span>
                </Button>

                {/* <Button onClick={handleShowNews} round disabled={!instrument()?.isin}>
                  <Icon src={iconInfo} />
                  <span>News</span>
                </Button> */}
              </Column>

              <Column xxl="auto" offset="ml" />

              {/* <Column xxl="auto">
                <Input.Group style={{ width: "300px" }}>
                  <Input.Group.Addon style={{ "box-shadow": "2px 2px 0px 0px gray", "max-height": "36px" }}>
                    <Icon src={iconDollarSign} />
                  </Input.Group.Addon>
                  <Input type="number" placeholder="Buy-In" disabled={!instrumentWatchListEntry} value={instrumentBuyIn()} onchange={e => setInstrumentBuyIn(e.currentTarget.valueAsNumber)} pattern="[^\d\.]+" />
                  <Input.Group.Addon style={{ "box-shadow": "2px 2px 0px 0px gray", "max-height": "36px" }}>
                    <Icon src={iconX} />
                  </Input.Group.Addon>
                  <Input type="number" placeholder="Shares" disabled={!instrumentWatchListEntry} value={instrumentShares()} onchange={e => setInstrumentShares(e.currentTarget.valueAsNumber)} pattern="[^\d\.]+" />
                </Input.Group>
              </Column> */}

              <Column xxl="auto">
                <Button onClick={toggleInstrumentInWatchList} disabled={!instrument()} action color={instrumentWatchListEntry() ? "failure" : undefined}>
                  <Icon src={iconBookmark} />
                </Button>
              </Column>
            </Column.Row>
          </div>

          <SymbolInfo
            style={{ height: "unset" }}
            name={details()?.company.name ?? instrument()?.shortName}
            isin={instrument()?.isin}
            symbol={instrument()?.intlSymbol || instrument()?.homeSymbol}
            logo={instrument()?.imageId ? `https://assets.traderepublic.com/img/${instrument()?.imageId}/dark.min.svg` : undefined}
            countryFlag={instrument()?.tags.find(tag => tag.type === "country")?.icon}
            exchange={exchange()?.exchangeId}
            value={value().current}
            currency={exchange()?.currency.id}
            valueAtPreviousClose={value().previous}
            buyIn={instrumentBuyIn()}
            shares={instrumentShares()}
            open={exchange()?.open}
            meta={[
              {
                key: "DERIVATIVES",
                value: instrument()?.derivativeProductCount.vanillaWarrant && "Warrants",
                href: `/trading/chart?isin=${instrument()?.isin}&warrants=true`,
              },
              {
                key: "UNDERLYING",
                value: instrument()?.derivativeInfo && instrument()!.derivativeInfo!.underlying.shortName,
                href: `/trading/chart?isin=${instrument()?.derivativeInfo?.underlying.isin}`,
              },
              // {
              //   key: "ASK",
              //   value: price() && numberCompactFormat.format(price()),
              // },
              {
                key: "MARKET CAP",
                value: details() && numberCompactFormat.format(details()!.company.marketCapSnapshot),
              },
              {
                key: "P/E",
                value: details() && numberCompactFormat.format(details()!.company.peRatioSnapshot),
              },
              {
                key: "TYPE",
                value: instrument()?.derivativeInfo && instrument()!.derivativeInfo!.properties.optionType,
                upperCase: true,
              },
              {
                key: "LEVERAGE",
                value: instrument()?.derivativeInfo && instrument()!.derivativeInfo!.properties.leverage?.toFixed(0),
              },
              {
                key: "RATIO",
                value: instrument()?.derivativeInfo && instrument()!.derivativeInfo!.properties.size?.toFixed(2),
              },
              {
                key: "EXPIRY",
                value: instrument()?.derivativeInfo && (instrument()!.derivativeInfo!.properties.lastTradingDay ? dateFormat.format(new Date(instrument()!.derivativeInfo!.properties.lastTradingDay!)) : "Open End"),
                upperCase: true,
              },
            ]}
          />

          <div style={{ display: "flex", "flex-direction": "column", "flex-grow": 1, "min-height": "480px" }}>
            <div ref={setChartContainer} style={{ height: "95%" }} />
          </div>

          <div style={{ background: "#1e222d", padding: "0.5rem" }}>
            {(() => {
              const TimeRangeLabel: Component<{ t: ReturnType<typeof timeRange> }> = props => (
                <A onclick={() => setTimeRange(props.t)} style={{ "margin-right": "0.2rem" }}>
                  <Label style={{ background: timeRange() === props.t ? "#3179f52e" : undefined }}>
                    {props.t}
                  </Label>
                </A>
              )

              return (
                <Column.Row>
                  <Column xxl={2} md={3}>
                    <TimeRangeLabel t="5min" />
                  </Column>

                  <Column xxl={10} md={9}>
                    <TimeRangeLabel t="1d" />
                    <TimeRangeLabel t="5d" />
                    <TimeRangeLabel t="1m" />
                    <TimeRangeLabel t="3m" />
                    <TimeRangeLabel t="1y" />
                    <TimeRangeLabel t="max" />
                  </Column>
                </Column.Row>
              )
            })()}
          </div>
        </Column>

        <Column xxl={3} md={12}>
          <WatchList>
            <For each={watchedInstruments()}>
              {i => (
                <WatchList.Ticker
                  isin={i.isin}
                  href={`?isin=${i.isin}`}
                  // symbol={`${i.data?.intlSymbol || i.data?.homeSymbol || i.isin}${(i.buyIn && i.shares) ? ` [x${i.shares} @ ${i.buyIn}]` : ""}`}
                  symbol={i.data?.intlSymbol || i.data?.homeSymbol || i.isin}
                  name={i.details?.company.name ?? i.data?.shortName}
                  logo={i.data?.imageId ? `https://assets.traderepublic.com/img/${i.data?.imageId}/dark.min.svg` : undefined}
                  open={i.exchange?.open}
                  value={i.value.current}
                  // valueAtPreviousClose={(i.buyIn && i.shares) ? i.buyIn : i.value.previous}
                  valueAtPreviousClose={i.value.previous}
                  highlighted={i.isin === instrument()?.isin}
                />
              )}
            </For>
          </WatchList>
        </Column>
      </Column.Row>
    </div>
  )
}

export default ChartView
