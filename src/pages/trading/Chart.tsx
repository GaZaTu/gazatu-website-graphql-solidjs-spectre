import { SMA } from "@debut/indicators"
import { createStorageSignal } from "@solid-primitives/storage"
import { useNavigate, useSearchParams } from "@solidjs/router"
import type { BarData, IChartApi, IPriceLine } from "lightweight-charts"
import { Component, ComponentProps, createEffect, createMemo, createRenderEffect, createSignal, For, onCleanup } from "solid-js"
import iconBookmark from "../../icons/iconBookmark"
import iconSearch from "../../icons/iconSearch"
import { Subscription, TraderepublicAggregateHistoryLightData, TraderepublicAggregateHistoryLightSub, TraderepublicHomeInstrumentExchangeData, TraderepublicInstrumentData, TraderepublicStockDetailsData, TraderepublicWebsocket } from "../../lib/traderepublic"
import A from "../../ui/A"
import Button from "../../ui/Button"
import Column from "../../ui/Column"
import Icon from "../../ui/Icon"
import Label from "../../ui/Label"
import Modal from "../../ui/Modal"
import ModalPortal from "../../ui/Modal.Portal"
import Table from "../../ui/Table"
import { createTableState } from "../../ui/Table.Helpers"
import Toaster from "../../ui/Toaster"
import "./Chart.css"
import SymbolInfo from "./SymbolInfo"
import SymbolSearch from "./SymbolSearch"
import WatchList from "./WatchList"

const dateFormat = new Intl.DateTimeFormat(undefined, {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
})

const currencyFormat = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "EUR",
})

const numberCompactFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  notation: "compact",
})

type SymbolSearchModalProps = {
  socket: TraderepublicWebsocket
  initialSearch?: string
  initialFilter?: "stock" | "fund" | "derivative" | "crypto"
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
        results.map(async ({ isin, type }) => {
          const instrument = await props.socket.instrument(isin).toPromise()
          // const exchange = await socket.exchange(instrument).toPromise()
          const details = await props.socket.details(instrument)

          return {
            isin,
            symbol: instrument?.intlSymbol || instrument?.homeSymbol,
            description: details?.company.name ?? instrument?.shortName,
            type,
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

const intradayHistory = {
  30: {} as { [isin: string]: TraderepublicAggregateHistoryLightData["aggregates"] | undefined },
  60: {} as { [isin: string]: TraderepublicAggregateHistoryLightData["aggregates"] | undefined },
}

const ChartView: Component = props => {
  const [search, setSearch] = useSearchParams()

  const navigate = useNavigate()

  const [timeRange, setTimeRange] = createStorageSignal("CHART_TIME_RANGE2", "1d" as "30s" | "60s" | TraderepublicAggregateHistoryLightSub["range"], {
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

  type WatchedInstrument = {
    isin: string
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

    for (const [key, history] of Object.entries(intradayHistory)) {
      (intradayHistory as any)[key] = watchList()
        ?.reduce((o, { isin }) => { o[isin] = history[isin] ?? []; return o }, {} as { [key: string]: any })
    }

    void (async () => {
      setWatchedInstruments(r => {
        return watchList()
          ?.map(({ isin }) => {
            const current = r.find(i => i.isin === isin)

            return {
              isin,
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

              for (const [key, history] of Object.entries(intradayHistory)) {
                const barTimeToLive = Number(key)
                const currentHistory = history[i.isin]
                if (!currentHistory) {
                  continue
                }

                const currentBar = currentHistory[currentHistory.length - 1]

                if ((data.bid.time - (currentBar?.time ?? 0)) >= (barTimeToLive * 1000)) {
                  if (currentBar) {
                    currentHistory[currentHistory.length - 1] = {
                      ...currentBar,
                      close: data.last.price,
                    }
                  }

                  currentHistory.push({
                    time: data.bid.time,
                    open: data.bid.price,
                    high: data.bid.price,
                    low: data.bid.price,
                    close: data.bid.price,
                    volume: 0,
                    adjValue: 0,
                  })
                } else {
                  currentHistory[currentHistory.length - 1] = {
                    ...currentBar,
                    close: data.bid.price,
                    low: Math.min(currentBar.low, data.bid.price),
                    high: Math.max(currentBar.high, data.bid.price),
                  }
                }
              }

              return {
                ...i,
                value: {
                  current: data.bid.price,
                  previous: data.pre.price,
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

    const movingAverageSeries = chart.addLineSeries({
      baseLineVisible: false,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    let movingAverageData = new SMA(0)

    const series = chart.addCandlestickSeries({
    })

    let currentBar = { time: 0 } as BarData
    let previousClose: IPriceLine | undefined

    void (async () => {
      if (isin.length !== 12) {
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

      let barTimeToLive = 10 * 60
      let priceBeforeChart = 0

      if (range !== "30s" && range !== "60s") {
        const history = await socket.aggregateHistory(instrument, range as any)

        if (effect.cancelled) {
          return
        }

        for (const aggregate of history.aggregates) {
          const utcTimestamp = mapUnixToUTC(aggregate.time)

          currentBar = {
            time: utcTimestamp,
            open: aggregate.open,
            close: aggregate.close,
            low: aggregate.low,
            high: aggregate.high,
          }

          series.update(currentBar)
        }

        if (history.aggregates.length >= 2) {
          const [{ time: time0 }, { time: time1 }] = history.aggregates
          const difference = (time1 - time0) / 1000

          barTimeToLive = difference
        }

        if (barTimeToLive > (10 * 60)) {
          priceBeforeChart = history.aggregates[0]?.close ?? 0
        }

        const begin = history.aggregates[0].time
        const end = history.lastAggregateEndTime
        const timePeriodInDays = Math.ceil((end - begin) / (24 * 60 * 60 * 1000))

        movingAverageData = new SMA(Math.min(timePeriodInDays, 25))

        for (const aggregate of history.aggregates) {
          const time = mapUnixToUTC(aggregate.time)
          const value = movingAverageData.nextValue(aggregate.close)

          movingAverageSeries.update({
            time,
            value,
          })
        }
      } else {
        if (range === "30s") {
          barTimeToLive = 30 as const
        } else if (range === "60s") {
          barTimeToLive = 60 as const
        }

        const history = intradayHistory[barTimeToLive as 30 | 60]
        const currentHistory = history[instrument.isin] ?? []

        for (const aggregate of currentHistory) {
          const utcTimestamp = mapUnixToUTC(aggregate.time)

          currentBar = {
            time: utcTimestamp,
            open: aggregate.open,
            close: aggregate.close,
            low: aggregate.low,
            high: aggregate.high,
          }

          series.update(currentBar)
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
            priceBeforeChart = priceBeforeChart || data.pre.price

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
              close: data.last.price,
            }

            // TODO

            series.update({
              ...currentBar,
            })

            currentBar = {
              time: utcTimestamp,
              open: data.bid.price,
              close: data.bid.price,
              low: data.bid.price,
              high: data.bid.price,
            }
          } else {
            currentBar = {
              ...currentBar,
              close: data.bid.price,
              low: Math.min(currentBar.low, data.bid.price),
              high: Math.max(currentBar.high, data.bid.price),
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
    return instrumentWatchListEntry()?.buyIn ?? 0
  })
  // const setInstrumentBuyIn = (value: number) => {
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
    return instrumentWatchListEntry()?.shares ?? 0
  })
  // const setInstrumentShares = (value: number) => {
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
      const isin = search.isin
      const derivatives = await socket.derivatives(isin)

      try {
        await ModalPortal.push(modal => {
          const [tableState, setTableState] = createTableState({})

          const table = Table.createContext({
            get data() {
              return derivatives.results
            },
            columns: [
              {
                accessorKey: "symbol",
                header: "SYMBOL",
                meta: { compact: true },
                maxSize: 100,
                enableSorting: false,
              },
              {
                accessorKey: "description",
                header: "DESCRIPTION",
                enableSorting: false,
              },
              {
                accessorKey: "type",
                header: "TYPE",
                meta: { compact: true },
                maxSize: 100,
                enableSorting: false,
              },
            ],
            state: tableState,
            // onGlobalFilterChange: tableOnGlobalFilterChange(setTableState),
            manualFiltering: true,
          })

          return (
            <Modal size="md" onclose={modal.reject} active>
              <Modal.Body>
                <For each={derivatives.results}>
                  {derivative => (
                    <p>
                      <A href={`/trading/chart?isin=${derivative.isin}`} onclick={modal.resolve}>{derivative.isin}</A>
                    </p>
                  )}
                </For>
                {/* <Table context={table} loading={props.loading} loadingSize="sm" striped hidePagination onclickRow={row => props.onSymbolClick?.(row.original)} toolbar={
                  <Column.Row class={`${centerChildren(true)}`} style={{ height: "100%" }} gaps="sm">
                    <For each={props.filters}>
                      {filter => (
                        <Column>
                          <A onclick={() => props.onFilterChange?.(filter)}>
                            <Label round color={filter.active ? "primary" : undefined}>{filter.name}</Label>
                          </A>
                        </Column>
                      )}
                    </For>
                  </Column.Row>
                } /> */}
              </Modal.Body>
            </Modal>
          )
        })
      } catch {
        navigate(`/trading/chart?isin=${isin}`)
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
              </Column>

              <Column xxl="auto" offset="ml">
                {/* <Span style={{ display: "inline-flex", marginRight: "0.5rem" }}>
                  <Control style={{ width: "80px" }}>
                    <Input placeholder="Buy-In" size="small" disabled={!instrumentWatchListEntry} value={instrumentBuyIn} onValueChange={setInstrumentBuyIn} filter="[^\d\.]+" />
                    <Icon icon={faEuroSign} size="small" />
                  </Control>
                  <Control style={{ width: "80px" }}>
                    <Icon icon={faTimes} size="small" />
                    <Input placeholder="Shares" size="small" disabled={!instrumentWatchListEntry} value={instrumentShares} onValueChange={setInstrumentShares} filter="[^\d\.]+" />
                  </Control>
                </Span> */}

                <Button onClick={toggleInstrumentInWatchList} disabled={!instrument()} action circle color={instrumentWatchListEntry() ? "failure" : undefined}>
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
                    <TimeRangeLabel t="30s" />
                    <TimeRangeLabel t="60s" />
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
                  symbol={i.data?.intlSymbol || i.data?.homeSymbol || i.isin}
                  name={i.details?.company.name ?? i.data?.shortName}
                  open={i.exchange?.open}
                  value={i.value.current}
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
