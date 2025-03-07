import type { CollectionToken, PortfolioToken } from "@/types/ark";
import Link from "next/link";
import { AnimatedMap } from "@/app/_components/AnimatedMap";
import Media from "@/app/_components/Media";
import { SUPPORTED_L2_CHAIN_ID } from "@/constants/env";
import { useLordsPrice } from "@/hooks/lords/useLordsPrice";
import { useTokenListing } from "@/hooks/market/useTokenListing";
import { useTokenMetadata } from "@/hooks/market/useTokenMetadata";
import { useStarkDisplayName } from "@/hooks/useStarkName";
import LordsIcon from "@/icons/lords.svg";
import {
  CollectionAddresses,
  getCollectionFromAddress,
} from "@realms-world/constants";
import { Button } from "@realms-world/ui/components/ui/button";
import { cn, formatNumber } from "@realms-world/utils";
import { Info } from "lucide-react";
import { formatEther } from "viem";

import { ViewOnMarketplace } from "../../ViewOnMarketplace";
import { CardAction } from "./CardAction";
import RealmResources from "./RealmResources";

export const L2ERC721Card = ({
  token,
  layout = "grid",
  selectable = false,
  isSelected = false,
}: {
  token: PortfolioToken;
  layout?: "grid" | "list";
  selectable?: boolean;
  isSelected?: boolean;
}) => {
  const isGrid = layout === "grid";
  const imageSize = isGrid ? 800 : 60;

  return (
    <div
      className={cn(
        "group flex transform border bg-background duration-300 hover:border-bright-yellow",
        isGrid ? "w-full flex-col" : "justify-between",
        isSelected &&
          "border-2 border-accent-foreground hover:border-accent-foreground/50",
      )}
    >
      <div>
        <div className={` ${!isGrid && "p-1"} relative`}>
          <div className="absolute z-0 h-full w-full from-black/50 transition-all duration-150 group-hover:bg-gradient-to-t"></div>
          {token.metadata?.image ? (
            <Media
              src={token.metadata.image}
              alt={token.metadata.name}
              mediaKey={token.metadata.image_key}
              className={isGrid ? "mx-auto" : ""}
              width={imageSize}
              height={imageSize}
            />
          ) : (
            <div className="w-96">
              <AnimatedMap />
            </div>
          )}
          {isGrid && (
            <span className="absolute bottom-1 right-1 bg-black px-1 py-1 text-xs">
              #{token.token_id}
            </span>
          )}

          <div className="absolute bottom-0 left-0 w-full px-3 opacity-0 transition-all duration-300 group-hover:bottom-4 group-hover:opacity-100">
            <TokenAttributes
              token={token}
              attributeKeys={["type", "tier", "level", "health"]}
            />
            {
              !selectable && (
                <div className="flex gap-x-4">
                  <ViewOnMarketplace
                    collection={token.collection_address}
                    icon
                    tokenId={token.token_id}
                  />
                  <Link
                    href={`/collection/${getCollectionFromAddress(token.collection_address)}/${token.token_id}`}
                  >
                    <Button>
                      <Info />
                    </Button>
                  </Link>
                </div>
              )
              /* <CardAction token={token} />*/
            }
          </div>
        </div>
      </div>

      <TokenDetails
        token={token}
        isGrid={isGrid}
        address={token.owner ?? token.minter ?? ""}
      />
      {selectable && (
        <div
          className={cn(
            "absolute right-2 top-2 h-5 w-5 flex-shrink-0 rounded-full shadow-lg",
            isSelected
              ? "border-[5px] border-primary bg-accent"
              : "bg-muted-foreground",
          )}
        />
      )}
    </div>
  );
};

const TokenDetails = ({
  token,
  isGrid,
  address,
}: {
  token: CollectionToken;
  isGrid: boolean;
  address?: string;
}) =>
  isGrid ? (
    <GridDetails token={token} address={address} />
  ) : (
    <ListDetails token={token} address={address} />
  );

const TokenAttributes = ({
  token,
  attributeKeys,
}: {
  token: CollectionToken;
  attributeKeys: string[];
}) => {
  const metadata = useTokenMetadata(token);
  if (!metadata?.attributes) return null;

  <table className="h-full min-w-full bg-black font-sans text-xs">
    <tbody>
      {attributeKeys.map((key: string) => {
        const attribute = metadata.attributes.find(
          (trait) => trait.key === key,
        );
        return attribute ? (
          <tr className="hover:bright-yellow hover:bg-theme-gray" key={key}>
            <td className="w-1/3 border px-2 py-1 uppercase">{key}</td>
            <td className="border px-2 py-1">{attribute.value}</td>
          </tr>
        ) : null;
      })}
    </tbody>
  </table>;
};

const GridDetails = ({
  token,
}: {
  token: CollectionToken | PortfolioToken;
  address?: string;
}) => (
  <div className="flex h-full w-full flex-col justify-between p-3">
    <div className="flex justify-between pb-2">
      <span className="truncate">{token.metadata?.name ?? ""}</span>
      <div className="flex justify-between font-sans">
        <Price token={token} />
        {/*token.last_price && (
          <span className="flex text-bright-yellow/50">
            {token.last_price}
            <LordsIcon className="ml-2 h-4 w-4 self-center fill-current" />
          </span>
        )*/}
      </div>
    </div>
    <div className="h-[48px]">
      {token.metadata?.attributes &&
        [
          CollectionAddresses["eternum-0"][SUPPORTED_L2_CHAIN_ID],
          CollectionAddresses.realms[SUPPORTED_L2_CHAIN_ID],
        ].includes(token.collection_address) && (
          <RealmResources traits={token.metadata.attributes} />
        )}
    </div>
  </div>
);

const Price = ({ token }: { token: CollectionToken | PortfolioToken }) => {
  const { lordsPrice } = useLordsPrice();

  return (
    <div className="flex justify-between">
      {token.price && (
        <div>
          <div className="flex text-lg">
            {formatEther(BigInt(token.price))}
            <LordsIcon className="mx-auto ml-2 h-4 w-4 self-center fill-bright-yellow" />
          </div>
          <div className="-mt-0.5 text-xs text-bright-yellow/60">
            {(
              (lordsPrice?.usdPrice ?? 0) *
              parseFloat(formatEther(BigInt(token.price)))
            ).toFixed(2)}{" "}
            USD
          </div>
        </div>
      )}
    </div>
  );
};

const ListDetails = ({
  token,
  address,
}: {
  token: CollectionToken;
  address?: string;
}) => {
  return (
    <div className="flex w-full justify-between space-x-6 self-center px-3">
      <div className="mr-auto flex justify-between self-center">
        <span className="">
          {decodeURIComponent(token.metadata?.name ?? "")}
        </span>
      </div>
      <div className="mr-auto flex self-center font-sans">
        {token.price}
        <LordsIcon className="mx-auto ml-3 h-6 w-6 fill-bright-yellow pb-1" />
      </div>
      <div className="fonts-sans ml-auto self-center text-xs">
        <Link href={`/user/${address}`}>
          <Button variant={"ghost"}>{useStarkDisplayName(address)}</Button>
        </Link>
      </div>
      <div className="absolute bottom-0 right-0 w-full px-3 opacity-0 transition-all duration-300 group-hover:bottom-2 group-hover:opacity-100">
        <CardAction token={token} />
      </div>
    </div>
  );
};
