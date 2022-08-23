import { Component, ComponentProps, createMemo, JSX, splitProps } from "solid-js"
import { Dynamic } from "solid-js/web"

type Merge<T, U> = Omit<T, keyof U> & U

export type ElementType = Component | keyof JSX.IntrinsicElements

type PropsWithAs<P, T extends ElementType> = P & { as?: T }

// type ComponentRefType<T extends ElementType> = ComponentProps<T> extends { ref?: infer Ref } ? Ref : never

// type ComponentForwardRefType<T extends ElementType> = ComponentProps<T> extends { fwRef?: infer Ref } ? Ref : never

// type ElementRefType<T extends ElementType> = ComponentForwardRefType<T> extends never
//   ? ComponentRefType<T>
//   : ComponentForwardRefType<T>

// type PropsWithForwardRef<P, T extends ElementType> = P & { fwRef?: ElementRefType<T> }

// type PolymorphicProps<T extends ElementType, P> = Omit<Merge<Merge<ComponentProps<T>, PropsWithAs<P, T>>, PropsWithForwardRef<P, T>>, 'ref'>
// eslint-disable-next-line @typescript-eslint/ban-types
export type PolymorphicProps<T extends ElementType, P = {}> = Merge<ComponentProps<T>, PropsWithAs<P, T>> & { children?: JSX.Element }

// export type ForwardableProps<T extends ElementType, P = {}> = Omit<Merge<ComponentProps<T>, PropsWithForwardRef<P, T>>, 'ref'>

function Polymorphic<T extends ElementType>(props: PolymorphicProps<T>) {
  const [polymorphicProps, componentProps] = splitProps(props, ["as"])

  return createMemo(() => {
    return (
      <Dynamic component={polymorphicProps.as} {...componentProps}>
        {componentProps.children}
      </Dynamic>
    )
  })
}

export default Polymorphic
